import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Employee } from 'src/entities/employee.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
         @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        let employeeDetails = null;
        
        // Get employee from database
        if (user.employee_id) {
            employeeDetails = await this.employeeRepository.findOne({ 
                where: { id: user.employee_id } 
            });
        }

        const payload = { 
            username: user.username, 
            sub: user.id, 
            role: user.role,
            employee_id: employeeDetails?.id || null,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            geo_location: employeeDetails?.geo_location || null
        };
        
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                ...user,
                employee: employeeDetails
            },
        };
    }

    async getProfile(userId: string) {
        return this.usersRepository.findOne({ where: { id: userId }, relations: ['employee'] });
    }

    async register(createUserDto: any) {
        // Check if user already exists
        const existingUser = await this.usersRepository.findOne({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email }
            ],
            relations: ['employee']
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
            createUserDto.geo_location = employee.geo_location; // Set geo_location based on employee
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
            is_email_verified: false,
            geo_location: createUserDto.geo_location,
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
        const user = await this.usersRepository.findOne({ where: { employee_id: employeeId } });
        if (user) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }
}
