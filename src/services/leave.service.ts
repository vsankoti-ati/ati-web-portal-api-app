import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApplication } from '../entities/leave-application.entity';
import { Leave } from '../entities/leave.entity';
import { User } from '../entities/user.entity';
import { ApprovalStatusEnum } from '../enum/approval-status-enum';

@Injectable()
export class LeaveService {
    constructor(
        @InjectRepository(LeaveApplication)
        private leaveAppRepository: Repository<LeaveApplication>,
        @InjectRepository(Leave)
        private leaveRepository: Repository<Leave>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    private isValidUUID(uuid: string): boolean {
        // More permissive UUID regex that accepts any valid hex UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    async getLeaveBalance(userId: string): Promise<any[]> {
        // Validate UUID format
        if (!this.isValidUUID(userId)) {
            throw new BadRequestException('Invalid user ID format. Expected a valid UUID.');
        }
        const leaveBalances = await this.leaveRepository.find({ where: { user_id: userId, year: new Date().getFullYear() } });
        return leaveBalances;
    }

    async getLeaveApplications(user: any, userId?: string): Promise<any[]> {
        const userLeaves = userId
            ? await this.leaveAppRepository.find({ where: { user_id: userId, user: { geo_location: user.geo_location } }, relations: ['user'] })
            : await this.leaveAppRepository.find({ where: {user: {geo_location: user.geo_location }}, relations: ['user'] });
        
        return userLeaves;
    }

    async applyLeave(leaveData: any): Promise<any> {
        // Validate that user exists
        const user = await this.userRepository.findOne({ 
            where: { id: leaveData.user_id } 
        });
        
        if (!user) {
            throw new NotFoundException(`User with ID ${leaveData.user_id} not found`);
        }
        
        const application = this.leaveAppRepository.create({
            ...leaveData,
            applied_date: new Date(),
            status: leaveData.status || 'pending',
            days_requested: Math.ceil((new Date(leaveData.end_date).getTime() - new Date(leaveData.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        });
        return this.leaveAppRepository.save(application);
    }

    async approveLeave(id: string, approverComments:string, approver: any): Promise<any> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid leave application ID format. Expected a valid UUID.');
        }
        
        // Get the leave application
        const application = await this.leaveAppRepository.findOne({ where: { id } });
        if (!application) {
            throw new NotFoundException(`Leave application with ID ${id} not found`);
        }
        
        // Update application status
        await this.leaveAppRepository.update(id, {
            status: ApprovalStatusEnum.Approved,
            approved_date: new Date(), 
            approved_by: approver.id, 
            approver_name: approver.name,
            approver_comments: approverComments,         
        });
        
        // Update leave balance
        const leaveBalance = await this.leaveRepository.findOne({
            where: {
                user_id: application.user_id,
                leave_type: application.leave_type
            }
        });
        
        if (leaveBalance) {
            await this.leaveRepository.save({
                id: leaveBalance.id,
                used_days: leaveBalance.used_days + application.days_requested,
                remaining_days: leaveBalance.remaining_days - application.days_requested,
                year: new Date().getFullYear(),
            });
        }
        
        return this.leaveAppRepository.findOne({ where: { id } });
    }

    async rejectLeave(id: string, approverComments:string, approver: any): Promise<any> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid leave application ID format. Expected a valid UUID.');
        }
        await this.leaveAppRepository.update(id, { status: ApprovalStatusEnum.Rejected,  approved_date: new Date(), 
            approved_by: approver.id, 
            approver_name: approver.name,
            approver_comments: approverComments,    });
        return this.leaveAppRepository.findOne({ where: { id } });
    }

    async createLeaveBalance(balanceData: any): Promise<any> {
        // Validate that user exists
        const user = await this.userRepository.findOne({ 
            where: { employee_id: balanceData.employee_id } 
        });
        
        if (!user) {
            throw new NotFoundException(`User with EmployeeId ${balanceData.employee_id} not found`);
        }
        
        const leave = this.leaveRepository.create(
            {
                leave_type: balanceData.leave_type, 
                user_id: user.id, 
                total_days: 10, 
                year: balanceData.year,
                remaining_days: balanceData.remaining_days, });
        const existingRecord = await this.leaveRepository.findOne({
            where: {
                user_id: user.id,
                leave_type: balanceData.leave_type,
                year: balanceData.year,
            }
        });

        if (existingRecord) {
            return this.leaveRepository.save({id: existingRecord.id, ...leave});
        }

        return this.leaveRepository.save(leave);
    }
}
