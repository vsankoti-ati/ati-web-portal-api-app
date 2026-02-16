import { Controller, Request, Post, UseGuards, Body, Get, Param, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @ApiOperation({ summary: 'User login', description: 'Authenticate user with username and password' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string', example: 'john.doe' },
                password: { type: 'string', example: 'password123' }
            },
            required: ['username', 'password']
        }
    })
    @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('signup')
    @ApiOperation({ summary: 'User registration', description: 'Create a new user account' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string', example: 'john.doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: 'Password@123' },
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' }
            },
            required: ['username', 'email', 'password', 'first_name', 'last_name']
        }
    })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
    async signup(@Body() createUserDto: any) {
        return this.authService.register(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get user profile', description: 'Get authenticated user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Request() req) {
        console.log('✅ [AuthController] Successfully passed JWT guard! User:', req.user);
        return this.authService.getProfile(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user/employee/:employeeId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get user by employee ID', description: 'Admin/HR only - Get user by employee ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin/HR access required' })
    async getUserByEmployeeId(@Param('employeeId') employeeId: string, @Request() req) {
        if (req.user?.role !== 'Admin' && req.user?.role !== 'HR') {
            throw new UnauthorizedException('Only admins or HR can access this endpoint');
        }
        return this.authService.getUserByEmployeeId(employeeId);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Forgot password', description: 'Request password reset email' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' }
            },
            required: ['email']
        }
    })
    @ApiResponse({ status: 200, description: 'Password reset email sent' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password', description: 'Reset password using token from email' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string', example: 'reset-token-from-email' },
                new_password: { type: 'string', example: 'NewPassword@123' }
            },
            required: ['token', 'new_password']
        }
    })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(@Body() body: { token: string; new_password: string }) {
        return this.authService.resetPassword(body.token, body.new_password);
    }
}
