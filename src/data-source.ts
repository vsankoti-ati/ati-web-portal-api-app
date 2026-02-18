import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { DefaultAzureCredential } from '@azure/identity';
import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import { LeaveApplication } from './entities/leave-application.entity';
import { Leave } from './entities/leave.entity';
import { Timesheet } from './entities/timesheet.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { Project } from './entities/project.entity';
import { Holiday } from './entities/holiday.entity';
import { HolidayCalendar } from './entities/holiday-calendar.entity';
import { Announcement } from './entities/announcement.entity';
import { WorkFromHomeRequest } from './entities/work-from-home-request.entity';
// Uncomment these when you create migrations for them:
// import { JobReferral } from './entities/job-referral.entity';
// import { JobOpening } from './entities/job-opening.entity';
// import { Document } from './entities/document.entity';
// import { Candidate } from './entities/candidate.entity';
// import { Address } from './entities/address.entity';

config();

const isProduction = process.env.NODE_ENV === 'production';

// Function to get Azure SQL access token using managed identity
async function getAzureSqlAccessToken(): Promise<string> {
    const credential = new DefaultAzureCredential();
    const tokenResponse = await credential.getToken('https://database.windows.net/.default');
    return tokenResponse.token;
}

// Base configuration
const baseConfig: Partial<DataSourceOptions> = {
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
    ],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    synchronize: false, // IMPORTANT: Always use migrations, never auto-sync
    migrationsRun: process.env.NODE_ENV === 'production',
    logging: true,
};

// Async function to create DataSource with managed identity support
export async function createDataSource(): Promise<DataSource> {
    if (isProduction) {
        // Production: Use managed identity
        const token = await getAzureSqlAccessToken();
        const dataSourceOptions: DataSourceOptions = {
            ...baseConfig,
            options: {
                encrypt: true,
                trustServerCertificate: false,
            },
            authentication: {
                type: 'azure-active-directory-access-token',
                options: {
                    token: token,
                },
            },
        } as DataSourceOptions;
        return new DataSource(dataSourceOptions);
    } else {
        // Development: Use username/password
        const dataSourceOptions: DataSourceOptions = {
            ...baseConfig,
            username: process.env.DB_USERNAME || 'sa',
            password: process.env.DB_PASSWORD || 'infy@123',
            options: {
                encrypt: process.env.NODE_ENV === 'production',
                trustServerCertificate: process.env.NODE_ENV === 'development',
            },
        } as DataSourceOptions;
        return new DataSource(dataSourceOptions);
    }
}

// Default export for development/backwards compatibility
export const AppDataSource = new DataSource({
    ...baseConfig,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'infy@123',
    options: {
        encrypt: process.env.NODE_ENV === 'production',
        trustServerCertificate: process.env.NODE_ENV === 'development',
    },
} as DataSourceOptions);
