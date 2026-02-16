import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkFromHomeRequest } from '../entities/work-from-home-request.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class WfhService {
    constructor(
        @InjectRepository(WorkFromHomeRequest)
        private wfhRepository: Repository<WorkFromHomeRequest>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
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

        return this.wfhRepository.save(wfhRequest);
    }

    async getWfhRequests(user: any, userId?: string): Promise<WorkFromHomeRequest[]> {
        // If admin, can see all requests
        // If employee, can only see their own requests
        if (user.role === 'Admin') {
            if (userId) {
                // Admin requesting specific user's requests
                if (!this.isValidUUID(userId)) {
                    throw new BadRequestException('Invalid user ID format. Expected a valid UUID.');
                }
                return this.wfhRepository.find({ 
                    where: { user_id: userId },
                    relations: ['user'],
                    order: { created_at: 'DESC' }
                });
            } else {
                // Admin requesting all requests
                return this.wfhRepository.find({ 
                    where: {user: { geo_location: user.geo_location }},
                    relations: ['user'],
                    order: { created_at: 'DESC' }
                });
            }
        } else {
            // Employee can only see their own requests
            return this.wfhRepository.find({ 
                where: { user_id: user.userId },
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
        
        // Get the WFH request
        const request = await this.wfhRepository.findOne({ where: { id } });
        if (!request) {
            throw new NotFoundException(`WFH request with ID ${id} not found`);
        }

        // Check if already processed
        if (request.status !== 'Pending') {
            throw new BadRequestException(`WFH request has already been ${request.status.toLowerCase()}`);
        }
        
        // Update request status
        await this.wfhRepository.update(id, {
            status: 'Approved',
            approved_date: new Date(), 
            approved_by: approver.userId, 
            approver_name: approver.name,
            approver_comments: approverComments,         
        });
        
        return this.wfhRepository.findOne({ where: { id }, relations: ['user'] });
    }

    async rejectWfhRequest(id: string, approverComments: string, approver: any): Promise<WorkFromHomeRequest> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid WFH request ID format. Expected a valid UUID.');
        }
        
        // Get the WFH request
        const request = await this.wfhRepository.findOne({ where: { id } });
        if (!request) {
            throw new NotFoundException(`WFH request with ID ${id} not found`);
        }

        // Check if already processed
        if (request.status !== 'Pending') {
            throw new BadRequestException(`WFH request has already been ${request.status.toLowerCase()}`);
        }
        
        // Update request status
        await this.wfhRepository.update(id, {
            status: 'Rejected',
            approved_date: new Date(), 
            approved_by: approver.userId, 
            approver_name: approver.name,
            approver_comments: approverComments,         
        });
        
        return this.wfhRepository.findOne({ where: { id }, relations: ['user'] });
    }
}
