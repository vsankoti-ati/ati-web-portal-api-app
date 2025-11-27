import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApplication } from '../entities/leave-application.entity';
import { Leave } from '../entities/leave.entity';
import { Employee } from '../entities/employee.entity';
import { MockDataService } from './mock-data.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class LeaveService {
    constructor(
        @InjectRepository(LeaveApplication)
        private leaveAppRepository: Repository<LeaveApplication>,
        @InjectRepository(Leave)
        private leaveRepository: Repository<Leave>,
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
        private mockDataService: MockDataService,
    ) { }

    async getLeaveBalance(employeeId: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const balances = this.mockDataService.getMockData('leave-balances');
            return balances.filter((b) => b.employee_id === employeeId);
        }
        return this.leaveRepository.find({ where: { employee_id: employeeId } });
    }

    async getLeaveApplications(employeeId?: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const applications = this.mockDataService.getMockData('leave-applications');
            return employeeId ? applications.filter((a) => a.employee_id === employeeId) : applications;
        }
        return employeeId
            ? this.leaveAppRepository.find({ where: { employee_id: employeeId } })
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
                employee_id: leaveData.employee_id,
            };
            applications.push(newApp);
            await this.mockDataService.saveMockData('leave-applications', applications);
            return newApp;
        }
        
        // Validate that employee exists
        const employee = await this.employeeRepository.findOne({ 
            where: { id: leaveData.employee_id } 
        });
        
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${leaveData.employee_id} not found`);
        }
        
        const application = this.leaveAppRepository.create({
            ...leaveData,
            applied_date: new Date(),
            status: leaveData.status || 'pending',
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
