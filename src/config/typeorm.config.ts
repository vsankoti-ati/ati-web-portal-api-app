import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DefaultAzureCredential } from '@azure/identity';
import { User } from '../entities/user.entity';
import { Employee } from '../entities/employee.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { Leave } from '../entities/leave.entity';
import { Timesheet } from '../entities/timesheet.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Project } from '../entities/project.entity';
import { Holiday } from '../entities/holiday.entity';
import { HolidayCalendar } from '../entities/holiday-calendar.entity';
import { Announcement } from '../entities/announcement.entity';
import { WorkFromHomeRequest } from '../entities/work-from-home-request.entity';
import { Address } from '../entities/address.entity';
import { Document } from '../entities/document.entity';
import { JobOpening } from '../entities/job-opening.entity';
import { JobReferral } from '../entities/job-referral.entity';
import { Candidate } from '../entities/candidate.entity';

const isProduction = process.env.NODE_ENV === 'production';

// Function to get Azure SQL access token using managed identity
export async function getAzureSqlAccessToken(): Promise<string> {
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://database.windows.net/.default');
    return tokenResponse.token;
}

// Base configuration
const baseConfig: Partial<TypeOrmModuleOptions> = {
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || 'ati_web_portal',
    entities: [
        User,
        Employee,
        LeaveApplication,
        Leave,
        Timesheet,
        TimeEntry,
        Project,
        Holiday,
        HolidayCalendar,
        Announcement,
        WorkFromHomeRequest,
        Address,
        Document,
        JobOpening,
        JobReferral,
        Candidate,
    ],
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development',
};

// Async factory for TypeORM configuration with managed identity support
export const typeOrmConfigFactory = async (): Promise<TypeOrmModuleOptions> => {
    if (isProduction) {
        // Production: Use managed identity
        const token = await getAzureSqlAccessToken();
        return {
            ...baseConfig,
            extra: {
                options: {
                    encrypt: true,
                    trustServerCertificate: false,
                },
                authentication: {
                    type: 'azure-active-directory-default',                
                },
            }
        } as TypeOrmModuleOptions;
    } else {
        // Development: Use username/password
        return {
            ...baseConfig,
            username: process.env.DB_USERNAME || 'sa',
            password: process.env.DB_PASSWORD || 'infy@123',
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        } as TypeOrmModuleOptions;
    }
};

// Export synchronous config for development/backwards compatibility
export const typeOrmConfig: TypeOrmModuleOptions = {
    ...baseConfig,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'infy@123',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
} as TypeOrmModuleOptions;
