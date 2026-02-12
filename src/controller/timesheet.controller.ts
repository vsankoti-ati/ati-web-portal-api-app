import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TimesheetService } from '../services/timesheet.service';

@Controller('timesheets')
@UseGuards(AuthGuard('jwt'))
export class TimesheetController {
    constructor(private timesheetService: TimesheetService) { }

    @Get()
    async getTimesheets(@Query('userId') userId: string, @Request() req) {
        // Admin can see all, employees see their own
        if (req.user?.role === 'Admin') {
            return this.timesheetService.getTimesheets(userId);
        }
        return this.timesheetService.getTimesheets(req.user?.userId);
    }

    @Get(':id')
    async getTimesheet(@Param('id') id: string) {
        return this.timesheetService.getTimesheet(id);
    }

    @Post()
    async createTimesheet(@Body() timesheetData: any, @Request() req) {
        return this.timesheetService.createTimesheet({ ...timesheetData, user_id: req.user?.userId });
    }

    @Post('entries')
    async addTimeEntry(@Body() entryData: any) {
        return this.timesheetService.addTimeEntry(entryData);
    }

    @Patch(':id/submit')
    async submitTimesheet(@Param('id') id: string) {
        return this.timesheetService.submitTimesheet(id);
    }

    @Patch(':id/approve')
    async approveTimesheet(@Param('id') id: string, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can approve timesheets');
        }
        return this.timesheetService.approveTimesheet(id, req.user?.userId);
    }

    @Patch(':id/reject')
    async rejectTimesheet(@Param('id') id: string, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can reject timesheets');
        }
        return this.timesheetService.rejectTimesheet(id, req.user?.userId);
    }

    @Get('projects/all')
    async getAllProjects() {
        return this.timesheetService.getAllProjects();
    }
}
