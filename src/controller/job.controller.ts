import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JobService } from '../services/job.service';

@Controller('jobs')
@UseGuards(AuthGuard('jwt'))
export class JobController {
    constructor(private jobService: JobService) { }

    @Get('openings')
    async getAllJobOpenings() {
        return this.jobService.getAllJobOpenings();
    }

    @Get('openings/:id')
    async getJobOpening(@Param('id') id: string) {
        return this.jobService.getJobOpening(id);
    }

    @Post('openings')
    async createJobOpening(@Body() jobData: any, @Request() req) {
        if (req.user.role !== 'Admin') {
            throw new Error('Only admins can create job openings');
        }
        return this.jobService.createJobOpening({ ...jobData, created_by: req.user.userId });
    }

    @Get('referrals')
    async getAllReferrals(@Query('employeeId') employeeId: string, @Request() req) {
        // Admin/HR can see all, employees see their own
        if (req.user.role === 'Admin' || req.user.role === 'HR') {
            return this.jobService.getAllReferrals(employeeId);
        }
        return this.jobService.getAllReferrals(req.user.userId);
    }

    @Post('referrals')
    async createReferral(@Body() referralData: any, @Request() req) {
        return this.jobService.createReferral({ ...referralData, referred_by: req.user.userId });
    }

    @Put('referrals/:id/status')
    async updateReferralStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req) {
        if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
            throw new Error('Only admin/HR can update referral status');
        }
        return this.jobService.updateReferralStatus(id, body.status);
    }
}
