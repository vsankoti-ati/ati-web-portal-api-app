import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        
        // Call the parent class's canActivate
        return super.canActivate(context);
    }

    handleRequest(err, user, info, context) {     
        
        if (err || !user) {
            console.log('❌ [JwtAuthGuard] Authentication FAILED!');
            console.log('   Reason:', info?.message || err?.message || 'Unknown');
            throw err || new UnauthorizedException(info?.message || 'Authentication failed');
        }
        
        console.log('✅ [JwtAuthGuard] Authentication SUCCESS!');
        return user;
    }
}
