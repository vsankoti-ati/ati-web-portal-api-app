import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LeaveService } from '../services/leave.service';
import { ApplyLeaveDto } from '../dto/apply-leave.dto';
import { CancelLeaveDto } from '../dto/cancel-leave.dto';

@ApiTags('Leave Management')
@Controller('leave')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class LeaveController {
    constructor(private leaveService: LeaveService) { }

    @Get('balance/:userId')
    @ApiOperation({ summary: 'Get leave balance for a user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Leave balance retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Invalid user ID format' })
    async getLeaveBalance(@Param('userId') userId: string) {
        return this.leaveService.getLeaveBalance(userId);
    }

    @Get('applications')
    @ApiOperation({ summary: 'Get leave applications', description: 'Employees see own applications, Admins see all' })
    @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
    @ApiResponse({ status: 200, description: 'Leave applications retrieved successfully' })
    async getLeaveApplications(@Query('userId') userId: string, @Request() req) {
        // Admin can see all, employees see their own
        if (req.user?.role === 'Admin') {
            return this.leaveService.getLeaveApplications(req.user);
        }
        return this.leaveService.getLeaveApplications(req, userId);
    }

    @Post('apply')
    @ApiOperation({ summary: 'Apply for leave' })
    @ApiResponse({ status: 201, description: 'Leave application submitted successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async applyLeave(@Body() leaveData: ApplyLeaveDto, @Request() req) {
        return this.leaveService.applyLeave({ ...leaveData, user_id: req.user?.userId });
    }

    @Patch(':id/approve')
    async approveLeave(@Param('id') id: string, @Body() approveDetails:any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can approve leave');
        }
        return this.leaveService.approveLeave(id, approveDetails.comments, req.user);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject leave application' })
    @ApiParam({ name: 'id', description: 'Leave application ID' })
    @ApiResponse({ status: 200, description: 'Leave application rejected successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Only admins can reject leave' })
    @ApiResponse({ status: 404, description: 'Leave application not found' })
    async rejectLeave(@Param('id') id: string, @Body() approveDetails:any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can reject leave');
        }
        return this.leaveService.rejectLeave(id, approveDetails.comments, req.user);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancel leave application' })
    @ApiParam({ name: 'id', description: 'Leave application ID' })
    @ApiResponse({ status: 200, description: 'Leave application cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request or leave cannot be cancelled' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Can only cancel own leave applications' })
    @ApiResponse({ status: 404, description: 'Leave application not found' })
    async cancelLeave(@Param('id') id: string, @Body() cancelData: CancelLeaveDto, @Request() req) {
        return this.leaveService.cancelLeave(id, cancelData.reason, req.user?.userId);
    }

    @Post('balance')
    async createLeaveBalance(@Body() balanceData: any, @Request() req) {
        if (req.user?.role !== 'Admin' && req.user?.role !== 'HR') {
            throw new UnauthorizedException('Only admins or HR can create leave balance');
        }
        return this.leaveService.createLeaveBalance(balanceData);
    }

    @Post('reports/generate')
    async generateLeaveReport(@Body() reportRequest: any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can generate reports');
        }
        return this.leaveService.generateLeaveReport(reportRequest, req.user);
    }
}
