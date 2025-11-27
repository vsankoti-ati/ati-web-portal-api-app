import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BearerStrategy } from 'passport-azure-ad';

@Injectable()
export class AzureADStrategy extends PassportStrategy(BearerStrategy, 'azure-ad') {
    constructor() {
        super({
            identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
            clientID: process.env.AZURE_CLIENT_ID,
            audience: process.env.AZURE_CLIENT_ID,
            loggingLevel: 'info',
            passReqToCallback: false,
        });
    }

    async validate(response: any) {
        const { preferred_username, name, oid } = response;
        return {
            userId: oid,
            username: preferred_username,
            name: name,
            role: 'Employee', // Default role, should be mapped from groups
        };
    }
}
