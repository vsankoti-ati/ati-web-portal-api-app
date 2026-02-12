import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import {EmployeeService } from '../services/employee.service';
import { EmployeeController } from '../controller/employee.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Employee]),
        AuthModule,
    ],
    controllers: [EmployeeController],
    providers: [EmployeeService],
    exports: [EmployeeService],
})
export class EmployeeModule { }
