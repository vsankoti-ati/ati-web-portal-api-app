import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import { Address } from './entities/address.entity';
import { Leave } from './entities/leave.entity';
import { LeaveApplication } from './entities/leave-application.entity';
import { JobOpening } from './entities/job-opening.entity';
import { JobReferral } from './entities/job-referral.entity';
import { Holiday } from './entities/holiday.entity';
import { Document } from './entities/document.entity';
import { Timesheet } from './entities/timesheet.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { Project } from './entities/project.entity';
import { Announcement } from './entities/announcement.entity';

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'YourPassword123',
    database: process.env.DB_DATABASE || 'IntranetPortal',
    entities: [
        User,
        Employee,
        Address,
        Leave,
        LeaveApplication,
        JobOpening,
        JobReferral,
        Holiday,
        Document,
        Timesheet,
        TimeEntry,
        Project,
        Announcement,
    ],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    synchronize: false, // Auto-create tables in dev
    migrationsRun: true, // Run migrations in prod
    logging: process.env.NODE_ENV === 'development',
    options: {
        encrypt: process.env.NODE_ENV === 'production', // Required for Azure SQL Database
        trustServerCertificate: process.env.NODE_ENV === 'development', // Only true for local development
    },
} as TypeOrmModuleOptions;
