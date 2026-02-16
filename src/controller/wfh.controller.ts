import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { WfhService } from '../services/wfh.service';

@ApiTags('Work From Home')
@Controller('wfh')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class WfhController {
    constructor(private wfhService: WfhService) { }

    @Post('submit')
    @ApiOperation({ summary: 'Submit a new WFH request', description: 'Employees can submit WFH requests for themselves' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                start_date: { type: 'string', format: 'date', example: '2026-02-20' },
                end_date: { type: 'string', format: 'date', example: '2026-02-22' },
                reason: { type: 'string', example: 'Working from home due to personal reasons' }
            },
            required: ['start_date', 'end_date', 'reason']
        }
    })
    @ApiResponse({ status: 201, description: 'WFH request created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async submitWfhRequest(@Body() requestData: any, @Request() req) {
        // Employees can only submit requests for themselves
        return this.wfhService.submitWfhRequest(requestData, req.user?.userId);
    }

    @Get('requests')
    @ApiOperation({ summary: 'Get WFH requests', description: 'Employees can see own requests, Admins can see all or filter by userId' })
    @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'List of WFH requests retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getWfhRequests(@Query('userId') userId: string, @Request() req) {
        // Admin can see all requests or filter by userId
        // Employees can only see their own requests
        return this.wfhService.getWfhRequests(req.user, userId);
    }

    @Patch(':id/approve')
    @ApiOperation({ summary: 'Approve WFH request', description: 'Admin only - Approve a pending WFH request' })
    @ApiParam({ name: 'id', description: 'WFH request ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                comments: { type: 'string', example: 'Approved' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'WFH request approved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'WFH request not found' })
    async approveWfhRequest(@Param('id') id: string, @Body() approveDetails: any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can approve WFH requests');
        }
        return this.wfhService.approveWfhRequest(id, approveDetails.comments || '', req.user);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject WFH request', description: 'Admin only - Reject a pending WFH request' })
    @ApiParam({ name: 'id', description: 'WFH request ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                comments: { type: 'string', example: 'Not approved due to business requirements' }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'WFH request rejected successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'WFH request not found' })
    async rejectWfhRequest(@Param('id') id: string, @Body() rejectDetails: any, @Request() req) {
        if (req.user?.role !== 'Admin') {
            throw new UnauthorizedException('Only admins can reject WFH requests');
        }
        return this.wfhService.rejectWfhRequest(id, rejectDetails.comments || '', req.user);
    }
}
