import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaveService } from '../services/leave.service';

@Controller('leave')
@UseGuards(AuthGuard('jwt'))
export class LeaveController {
    constructor(private leaveService: LeaveService) { }

    @Get('balance/:userId')
    async getLeaveBalance(@Param('userId') userId: string) {
        return this.leaveService.getLeaveBalance(userId);
    }

    @Get('applications')
    async getLeaveApplications(@Query('userId') userId: string, @Request() req) {
        // Admin can see all, employees see their own
        if (req.user?.role === 'Admin') {
            return this.leaveService.getLeaveApplications(userId);
        }
        return this.leaveService.getLeaveApplications(userId);
    }

    @Post('apply')
    async applyLeave(@Body() leaveData: any, @Request() req) {
        return this.leaveService.applyLeave({ ...leaveData, user_id: req.user?.userId });
    }

    @Patch(':id/approve')
    async approveLeave(@Param('id') id: string, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can approve leave');
        }
        return this.leaveService.approveLeave(id);
    }

    @Patch(':id/reject')
    async rejectLeave(@Param('id') id: string, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can reject leave');
        }
        return this.leaveService.rejectLeave(id);
    }

    @Post('balance')
    async createLeaveBalance(@Body() balanceData: any, @Request() req) {
        if (req.user?.role !== 'Admin' && req.user?.role !== 'HR') {
            throw new UnauthorizedException('Only admins or HR can create leave balance');
        }
        return this.leaveService.createLeaveBalance(balanceData);
    }
}
