import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApplication } from '../entities/leave-application.entity';
import { Leave } from '../entities/leave.entity';
import { User } from 'src/entities/user.entity';
import { MockDataService } from './mock-data.service';

@Injectable()
export class LeaveService {
    constructor(
        @InjectRepository(LeaveApplication)
        private leaveAppRepository: Repository<LeaveApplication>,
        @InjectRepository(Leave)
        private leaveRepository: Repository<Leave>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private mockDataService: MockDataService,
    ) { }

    async getLeaveBalance(userId: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const balances = this.mockDataService.getMockData('leave-balances');
            return balances.filter((b) => b.user_id === userId);
        }
        const leaveBalances = await this.leaveRepository.find({ where: { user_id: userId, year: new Date().getFullYear() } });
        return leaveBalances;
    }

    async getLeaveApplications(userId?: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const applications = this.mockDataService.getMockData('leave-applications');
            return userId ? applications.filter((a) => a.user_id === userId) : applications;
        }
        const userLeaves = userId
            ? this.leaveAppRepository.find({ where: { user_id: userId }, relations: ['user'] })
            : this.leaveAppRepository.find({ relations: ['user'] });
        
        return userLeaves;
    }

    async applyLeave(leaveData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const applications = this.mockDataService.getMockData('leave-applications');
            const newApp = {
                id: `leave-app-${Date.now()}`,
                ...leaveData,
                applied_date: new Date().toISOString().split('T')[0],
                status: 'pending',
                user_id: leaveData.user_id,
                days_requested: Math.ceil((new Date(leaveData.end_date).getTime() - new Date(leaveData.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
            };
            applications.push(newApp);
            await this.mockDataService.saveMockData('leave-applications', applications);
            return newApp;
        }
        
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
        if (process.env.USE_MOCK_DATA === 'true') {
            const applications = this.mockDataService.getMockData('leave-applications');
            const app = applications.find((a) => a.id === id);
            if (app) {
                app.status = 'approved';
                await this.mockDataService.saveMockData('leave-applications', applications);
                
                // Update leave balance
                const balances = this.mockDataService.getMockData('leave-balances');
                const balance = balances.find((b) => b.user_id === app.user_id && b.leave_type === app.leave_type);
                if (balance) {
                    balance.used_days += app.days_requested;
                    balance.remaining_days -= app.days_requested;
                    await this.mockDataService.saveMockData('leave-balances', balances);
                }
            }
            return app;
        }
        
        // Get the leave application
        const application = await this.leaveAppRepository.findOne({ where: { id } });
        if (!application) {
            throw new NotFoundException(`Leave application with ID ${id} not found`);
        }
        
        // Update application status
        await this.leaveAppRepository.update(id,
            {  
                status: 'Approved',
                approved_date: new Date(), 
                approved_by: `${approver.first_name} ${approver.last_name}`, 
                approver_comments: approver.approver_comments,         
            });
        
        // Update leave balance
        const leaveBalance = await this.leaveRepository.findOne({
            where: {
                user_id: application.user_id,
                leave_type: application.leave_type
            }
        });
        
        if (leaveBalance) {
            await this.leaveRepository.update(leaveBalance.id, {
                used_days: leaveBalance.used_days + application.days_requested,
                remaining_days: leaveBalance.remaining_days - application.days_requested,
                year: new Date().getFullYear(),
            });
        }
        
        return this.leaveAppRepository.findOne({ where: { id } });
    }

    async rejectLeave(id: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const applications = this.mockDataService.getMockData('leave-applications');
            const app = applications.find((a) => a.id === id);
            if (app) {
                app.status = 'rejected';
                await this.mockDataService.saveMockData('leave-applications', applications);
            }
            return app;
        }
        await this.leaveAppRepository.update(id, { status: 'rejected' });
        return this.leaveAppRepository.findOne({ where: { id } });
    }

    async createLeaveBalance(balanceData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const balances = this.mockDataService.getMockData('leave-balances');
            const newBalance = {
                id: `leave-bal-${Date.now()}`,
                ...balanceData,
            };
            balances.push(newBalance);
            await this.mockDataService.saveMockData('leave-balances', balances);
            return newBalance;
        }
        
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
