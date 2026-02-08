import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { MockDataService } from './mock-data.service';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
        private mockDataService: MockDataService,
    ) { }

    async findAll(): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            return this.mockDataService.getMockData('employees');
        }
        return this.employeeRepository.find();
    }

    async findOne(id: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const employees = this.mockDataService.getMockData('employees');
            return employees.find((e) => e.id === id);
        }
        return this.employeeRepository.findOne({ where: { id } });
    }

    async findByEmail(emailId: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const employees = this.mockDataService.getMockData('employees');
            return employees.find((e) => e.email_id === emailId);
        }
        return this.employeeRepository.findOne({ where: { email_id: emailId } });
    }

    async create(employeeData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const employees = this.mockDataService.getMockData('employees');
            const newEmployee = { id: `emp-${Date.now()}`, ...employeeData };
            employees.push(newEmployee);
            await this.mockDataService.saveMockData('employees', employees);
            return newEmployee;
        }
        const employee = this.employeeRepository.create(employeeData);
        return this.employeeRepository.save(employee);
    }

    async update(id: string, employeeData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const employees = this.mockDataService.getMockData('employees');
            const index = employees.findIndex((e) => e.id === id);
            if (index !== -1) {
                employees[index] = { ...employees[index], ...employeeData };
                await this.mockDataService.saveMockData('employees', employees);
                return employees[index];
            }
            return null;
        }
        await this.employeeRepository.update(id, employeeData);
        return this.findOne(id);
    }

    async delete(id: string): Promise<void> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const employees = this.mockDataService.getMockData('employees');
            const filtered = employees.filter((e) => e.id !== id);
            await this.mockDataService.saveMockData('employees', filtered);
            return;
        }
        await this.employeeRepository.delete(id);
    }
}
