import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkFromHomeRequest } from '../entities/work-from-home-request.entity';
import { User } from '../entities/user.entity';
import { WfhApprovedEvent } from '../events/wfh-approved.event';
import { WfhRejectedEvent } from '../events/wfh-rejected.event';
import { WfhSubmittedEvent } from '../events/wfh-submitted.event';

@Injectable()
export class WfhService {
    constructor(
        @InjectRepository(WorkFromHomeRequest)
        private wfhRepository: Repository<WorkFromHomeRequest>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private eventEmitter: EventEmitter2,
    ) { }

    private isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    async submitWfhRequest(requestData: any, userId: string): Promise<WorkFromHomeRequest> {
        // Validate that user exists
        if (!this.isValidUUID(userId)) {
            throw new BadRequestException('Invalid user ID format. Expected a valid UUID.');
        }

        const user = await this.userRepository.findOne({ 
            where: { id: userId } 
        });
        
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // Validate dates
        const startDate = new Date(requestData.start_date);
        const endDate = new Date(requestData.end_date);

        if (endDate < startDate) {
            throw new BadRequestException('End date must be after or equal to start date');
        }

        // Create the WFH request
        const wfhRequest = this.wfhRepository.create({
            user_id: userId,
            start_date: startDate,
            end_date: endDate,
            reason: requestData.reason,
            status: 'Pending',
        });

        const savedRequest = await this.wfhRepository.save(wfhRequest);

        // Emit event for email notification to admins
        const wfhSubmittedEvent = new WfhSubmittedEvent(
            savedRequest.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            startDate,
            endDate,
            requestData.reason,
            user.geo_location,
        );
        this.eventEmitter.emit('wfh.submitted', wfhSubmittedEvent);

        return savedRequest;
    }

    async getWfhRequests(user: any, userId?: string): Promise<WorkFromHomeRequest[]> {
        // Calculate date 3 months ago
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // If admin, can see all requests
        // If employee, can only see their own requests
        if (user.role === 'Admin') {
            if (userId) {
                // Admin requesting specific user's requests
                if (!this.isValidUUID(userId)) {
                    throw new BadRequestException('Invalid user ID format. Expected a valid UUID.');
                }
                return this.wfhRepository.find({ 
                    where: { user_id: userId, created_at: MoreThanOrEqual(threeMonthsAgo) },
                    relations: ['user'],
                    order: { created_at: 'DESC' }
                });
            } else {
                // Admin requesting all requests
                return this.wfhRepository.find({ 
                    where: {user: { geo_location: user.geo_location }, created_at: MoreThanOrEqual(threeMonthsAgo)},
                    relations: ['user'],
                    order: { created_at: 'DESC' }
                });
            }
        } else {
            // Employee can only see their own requests
            return this.wfhRepository.find({ 
                where: { user_id: user.userId, created_at: MoreThanOrEqual(threeMonthsAgo) },
                relations: ['user'],
                order: { created_at: 'DESC' }
            });
        }
    }

    async approveWfhRequest(id: string, approverComments: string, approver: any): Promise<WorkFromHomeRequest> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid WFH request ID format. Expected a valid UUID.');
        }
        
        // Get the WFH request with user details
        const request = await this.wfhRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        if (!request) {
            throw new NotFoundException(`WFH request with ID ${id} not found`);
        }

        // Check if already processed
        if (request.status !== 'Pending') {
            throw new BadRequestException(`WFH request has already been ${request.status.toLowerCase()}`);
        }

        // Get user details for email
        const user = await this.userRepository.findOne({ where: { id: request.user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${request.user_id} not found`);
        }
        
        // Update request status
        await this.wfhRepository.update(id, {
            status: 'Approved',
            approved_date: new Date(), 
            approved_by: approver.userId, 
            approver_name: `${approver.first_name} ${approver.last_name}`,
            approver_comments: approverComments,         
        });

        // Emit event for email notification
        const wfhApprovedEvent = new WfhApprovedEvent(
            request.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            request.start_date,
            request.end_date,
            request.reason,
            `${approver.first_name} ${approver.last_name}`,
            approverComments || '',
        );
        this.eventEmitter.emit('wfh.approved', wfhApprovedEvent);
        
        return this.wfhRepository.findOne({ where: { id }, relations: ['user'] });
    }

    async rejectWfhRequest(id: string, approverComments: string, approver: any): Promise<WorkFromHomeRequest> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid WFH request ID format. Expected a valid UUID.');
        }
        
        // Get the WFH request with user details
        const request = await this.wfhRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        if (!request) {
            throw new NotFoundException(`WFH request with ID ${id} not found`);
        }

        // Check if already processed
        if (request.status !== 'Pending') {
            throw new BadRequestException(`WFH request has already been ${request.status.toLowerCase()}`);
        }

        // Get user details for email
        const user = await this.userRepository.findOne({ where: { id: request.user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${request.user_id} not found`);
        }
        
        // Update request status
        await this.wfhRepository.update(id, {
            status: 'Rejected',
            approved_date: new Date(), 
            approved_by: approver.userId, 
            approver_name: `${approver.first_name} ${approver.last_name}`,
            approver_comments: approverComments,         
        });

        // Emit event for email notification
        const wfhRejectedEvent = new WfhRejectedEvent(
            request.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            request.start_date,
            request.end_date,
            request.reason,
            `${approver.first_name} ${approver.last_name}`,
            approverComments || '',
        );
        this.eventEmitter.emit('wfh.rejected', wfhRejectedEvent);
        
        return this.wfhRepository.findOne({ where: { id }, relations: ['user'] });
    }

    async cancelWfhRequest(id: string, cancelReason: string, userId: string): Promise<WorkFromHomeRequest> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid WFH request ID format. Expected a valid UUID.');
        }

        // Get the WFH request
        const request = await this.wfhRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        
        if (!request) {
            throw new NotFoundException(`WFH request with ID ${id} not found`);
        }

        // Check if the user owns this WFH request
        if (request.user_id !== userId) {
            throw new UnauthorizedException('You can only cancel your own WFH requests');
        }

        // Check if request is in a cancellable state
        const cancellableStatuses = ['Pending', 'Approved'];
        if (!cancellableStatuses.includes(request.status)) {
            throw new BadRequestException(`Cannot cancel WFH request with status: ${request.status}`);
        }

        // Check if the request is approved and the start date is in the past
        if (request.status === 'Approved') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Parse the start date
            const startDate = request.start_date instanceof Date 
                ? request.start_date 
                : new Date(request.start_date);
            startDate.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                throw new BadRequestException('Cannot cancel an approved WFH request that has already started or is in the past');
            }
        }

        // Update request status to cancelled and update reason
        await this.wfhRepository.update(id, { 
            status: 'Cancelled',
            reason: cancelReason,
        });

        return this.wfhRepository.findOne({ where: { id }, relations: ['user'] });
    }
}
