import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JWT_SECRET } from '../config/jwt.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    async validate(payload: any) {
       return { 
            userId: payload.sub, 
            username: payload.username, 
            role: payload.role,
            employee_id: payload.employee_id,
            email: payload.email,
            first_name: payload.first_name,
            last_name: payload.last_name,
            geo_location: payload.geo_location
        };
    }
}
