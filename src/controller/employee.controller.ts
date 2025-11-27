import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from '../services/employee.service';

@Controller('employees')
export class EmployeeController {
    constructor(private employeeService: EmployeeService) { }

    @Get()
    async getAllEmployees(@Request() req) {
        console.log('GET /employees - req.user:', req.user);
        // For now, return all employees without auth check
        return this.employeeService.findAll();
    }

    @Get(':id')
    async getEmployee(@Param('id') id: string, @Request() req) {
        console.log(`GET /employees/${id} - req.user:`, req.user);
        // For now, return the employee without auth check
        return this.employeeService.findOne(id);
    }

    @Post()
    async createEmployee(@Body() employeeData: any, @Request() req) {
        if (req.user.role !== 'Admin') {
            throw new Error('Only admins can create employees');
        }
        return this.employeeService.create(employeeData);
    }

    @Put(':id')
    async updateEmployee(@Param('id') id: string, @Body() employeeData: any, @Request() req) {
        // Admin can update any, employees can update their own
        if (req.user.role === 'Admin' || req.user.userId === id) {
            return this.employeeService.update(id, employeeData);
        }
        throw new Error('Unauthorized');
    }

    @Delete(':id')
    async deleteEmployee(@Param('id') id: string, @Request() req) {
        if (req.user.role !== 'Admin') {
            throw new Error('Only admins can delete employees');
        }
        return this.employeeService.delete(id);
    }
}
