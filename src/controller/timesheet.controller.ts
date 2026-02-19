import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TimesheetService } from '../services/timesheet.service';
import { CancelRequestDto } from '../dto/cancel-request.dto';

@ApiTags('Timesheets')
@Controller('timesheets')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class TimesheetController {
    constructor(private timesheetService: TimesheetService) { }

    @Get()
    async getTimesheets(@Query('userId') userId: string, @Request() req) {
        // Admin can see all, employees see their own
        if (req.user?.role === 'Admin') {
            return this.timesheetService.getTimesheets(req.user, userId);
        }
        return this.timesheetService.getTimesheets(req.user, req.user?.userId);
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
    async approveTimesheet(@Param('id') id: string, @Body() body:any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can approve timesheets');
        }
        return this.timesheetService.approveTimesheet(id, body.approver_comments, req.user?.userId);
    }

    @Patch(':id/reject')
    async rejectTimesheet(@Param('id') id: string, @Body() body: any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can reject timesheets');
        }
        return this.timesheetService.rejectTimesheet(id, body.submitter_comments, req.user?.userId);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancel timesheet', description: 'Cancel your own timesheet' })
    @ApiParam({ name: 'id', description: 'Timesheet ID' })
    @ApiResponse({ status: 200, description: 'Timesheet cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request or timesheet cannot be cancelled' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Can only cancel own timesheets' })
    @ApiResponse({ status: 404, description: 'Timesheet not found' })
    async cancelTimesheet(@Param('id') id: string, @Body() cancelData: CancelRequestDto, @Request() req) {
        return this.timesheetService.cancelTimesheet(id, cancelData.reason, req.user?.userId);
    }

    @Get('projects/all')
    async getAllProjects() {
        return this.timesheetService.getAllProjects();
    }

    @Post('reports/generate')
    async generateTimesheetReport(@Body() reportRequest: any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can generate reports');
        }
        return this.timesheetService.generateTimesheetReport(reportRequest, req.user);
    }
}
