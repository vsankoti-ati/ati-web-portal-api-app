import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaveService } from '../services/leave.service';

@Controller('leave')
@UseGuards(AuthGuard('jwt'))
export class LeaveController {
    constructor(private leaveService: LeaveService) { }

    @Get('balance/:employeeId')
    async getLeaveBalance(@Param('employeeId') employeeId: string) {
        return this.leaveService.getLeaveBalance(employeeId);
    }

    @Get('applications')
    async getLeaveApplications(@Query('employeeId') employeeId: string, @Request() req) {
        // Admin can see all, employees see their own
        if (req.user.role === 'Admin') {
            return this.leaveService.getLeaveApplications(employeeId);
        }
        return this.leaveService.getLeaveApplications(req.user.userId);
    }

    @Post('apply')
    async applyLeave(@Body() leaveData: any, @Request() req) {
        return this.leaveService.applyLeave({ ...leaveData});
    }

    @Patch(':id/approve')
    async approveLeave(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'Admin') {
            throw new Error('Only admins can approve leave');
        }
        return this.leaveService.approveLeave(id);
    }

    @Patch(':id/reject')
    async rejectLeave(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'Admin') {
            throw new Error('Only admins can reject leave');
        }
        return this.leaveService.rejectLeave(id);
    }
}
