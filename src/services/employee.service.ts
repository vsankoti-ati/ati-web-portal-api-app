import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { EmployeeEnum } from '../enum/employee-enum';
import { EmployeeStatusEnum } from 'src/enum/employee-status-enum';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
    ) { }

    async findAll(user: any, includeInActive:boolean = false): Promise<any[]> {

        const result = await this.employeeRepository.find({where : { employee_status: !includeInActive ? EmployeeStatusEnum.ACTIVE : In([EmployeeStatusEnum.INACTIVE, EmployeeStatusEnum.ACTIVE]), geo_location: In([user.geo_location, EmployeeEnum.GLOBAL]) }});
        return result;
    }

    async findOne(id: string): Promise<any> {
        return this.employeeRepository.findOne({ where: { id } });
    }

    async findByEmail(emailId: string): Promise<any> {
        return this.employeeRepository.findOne({ where: { email_id: emailId } });
    }

    async create(employeeData: any): Promise<any> {
        const employee = this.employeeRepository.create(employeeData);
        return this.employeeRepository.save(employee);
    }

    async update(id: string, employeeData: any): Promise<any> {
        await this.employeeRepository.update(id, employeeData);
        return this.findOne(id);
    }

    async delete(id: string): Promise<void> {
        await this.employeeRepository.delete(id);
    }

    async updateEmployeeStatus(id: string, employee_status: string, admin_comments: string, admin_user_id: string): Promise<any> {
        await this.employeeRepository.update(id, { 
            employee_status, 
            admin_comments,
            updated_at: new Date(),
            is_active: employee_status === 'Active' ? true : false
        });
        return this.findOne(id);
    }
}
