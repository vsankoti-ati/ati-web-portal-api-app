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
        return this.leaveRepository.find({ where: { user_id: userId } });
    }

    async getLeaveApplications(userId?: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const applications = this.mockDataService.getMockData('leave-applications');
            return userId ? applications.filter((a) => a.user_id === userId) : applications;
        }
        return userId
            ? this.leaveAppRepository.find({ where: { user_id: userId } })
            : this.leaveAppRepository.find();
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

    async approveLeave(id: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const applications = this.mockDataService.getMockData('leave-applications');
            const app = applications.find((a) => a.id === id);
            if (app) {
                app.status = 'approved';
                await this.mockDataService.saveMockData('leave-applications', applications);
            }
            return app;
        }
        await this.leaveAppRepository.update(id, { status: 'approved' });
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
}
