import { DataSource } from 'typeorm';
import { config } from 'dotenv';
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

export const AppDataSource = new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'infy@123',
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
    options: {
        encrypt: true,
        trustServerCertificate: process.env.NODE_ENV === 'development',
    },
});
