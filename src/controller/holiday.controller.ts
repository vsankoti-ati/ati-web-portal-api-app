import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HolidayService } from '../services/holiday.service';

@Controller('holidays')
@UseGuards(AuthGuard('jwt'))
export class HolidayController {
    constructor(private holidayService: HolidayService) { }

    @Get()
    async getAllHolidays(@Query('year') year: string, @Query('client') client: string) {
        const yearNum = year ? parseInt(year) : undefined;
        return this.holidayService.getAllHolidays(yearNum, client);
    }

    @Post()
    async createHoliday(@Body() holidayData: any, @Request() req) {
        if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
            throw new Error('Only admin/HR can create holidays');
        }
        return this.holidayService.createHoliday(holidayData.holidays);
    }

    @Delete(':id')
    async deleteHoliday(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'Admin') {
            throw new Error('Only admins can delete holidays');
        }
        return this.holidayService.deleteHoliday(id);
    }
}
