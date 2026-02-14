import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { Employee } from '../entities/employee.entity';
import { EmailService } from './email.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JWT_SECRET } from '../config/jwt.config';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Employee]),
        PassportModule,
        JwtModule.register({
            secret: JWT_SECRET,
            signOptions: { expiresIn: '60m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy, EmailService, JwtAuthGuard],
    exports: [AuthService, PassportModule, JwtStrategy],
})
export class AuthModule {
    constructor() {
        console.log('🔧 [AuthModule] Initialized with JWT_SECRET:', JWT_SECRET);
    }
}
