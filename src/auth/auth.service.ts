import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { MockDataService } from '../services/mock-data.service';
import { config } from "dotenv";
import { Employee } from 'src/entities/employee.entity';
config();

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
         @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
        private jwtService: JwtService,
        private mockDataService: MockDataService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const mockUsers = this.mockDataService.getMockData('users');
            const user = mockUsers.find((u) => u.username === username);
            if (user && user.password === pass) { // Plain text for mock
                const { password, ...result } = user;
                return result;
            }
            return null;
        }

        const user = await this.usersRepository.findOne({ where: { username } });
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async getProfile(userId: string) {
        if (process.env.USE_MOCK_DATA === 'true') {
            const users = this.mockDataService.getMockData('users');
            const user = users.find((u) => u.id === userId);
            if (user) {
                const { password, ...result } = user;

                // Find matching employee by email
                const employees = this.mockDataService.getMockData('employees');
                const employee = employees.find((e) => e.email_id === user.email);

                return {
                    ...result,
                    employee_id: employee?.id || null,
                };
            }
            return null;
        }
        return this.usersRepository.findOne({ where: { id: userId } });
    }

    async register(createUserDto: any) {
        // Check if user already exists
        const existingUser = await this.usersRepository.findOne({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email }
            ]
        });

        if (existingUser) {
            throw new UnauthorizedException('Username or email already exists');
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(createUserDto.password, saltRounds);
        
        // Get the employee associated with the email, if exists
        const employee = await this.employeeRepository.findOne({ where: { email_id: createUserDto.email } });
        if (employee) {
            createUserDto.employee_id = employee.id;
        }else{
            createUserDto.employee_id = null; // Or handle as needed if no employee found
        }
        // Create new user
        const newUser = this.usersRepository.create({
            username: createUserDto.username,
            email: createUserDto.email,
            employee_id: createUserDto.employee_id,
            password_hash: password_hash,
            first_name: createUserDto.first_name,
            last_name: createUserDto.last_name,
            role: createUserDto.role || 'Employee',
            auth_provider: 'Local',
            is_active: true,
            is_email_verified: false
        });

        // Save user to database
        const savedUser = await this.usersRepository.save(newUser);

        // Remove password_hash from response
        const { password_hash: _, ...result } = savedUser;

        return {
            message: 'User registered successfully',
            user: result
        };
    }

    async getUserByEmployeeId(employeeId: string) {
        if (process.env.USE_MOCK_DATA === 'true') {
            const users = this.mockDataService.getMockData('users');
            const user = users.find((u) => u.employee_id === employeeId);
            if (user) {
                const { password, ...result } = user;
                return result;
            }
            return null;
        }
        
        const user = await this.usersRepository.findOne({ where: { employee_id: employeeId } });
        if (user) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }
}
