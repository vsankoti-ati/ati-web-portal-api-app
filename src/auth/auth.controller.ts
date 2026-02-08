import { Controller, Request, Post, UseGuards, Body, Get, Param, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('signup')
    async signup(@Body() createUserDto: any) {
        return this.authService.register(createUserDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('user/employee/:employeeId')
    async getUserByEmployeeId(@Param('employeeId') employeeId: string, @Request() req) {
        if (req.user?.role !== 'Admin' && req.user?.role !== 'HR') {
            throw new UnauthorizedException('Only admins or HR can access this endpoint');
        }
        return this.authService.getUserByEmployeeId(employeeId);
    }
}
