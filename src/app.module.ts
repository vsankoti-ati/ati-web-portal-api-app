import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { AnnouncementsController } from './controller/announcements.controller';
import { EmployeeModule } from './employee/employee.module';
import { LeaveModule } from './leave/leave.module';
import { JobModule } from './job/job.module';
import { HolidayModule } from './holiday/holiday.module';
import { TimesheetModule } from './timesheet/timesheet.module';
import { DocumentModule } from './document/document.module';
import { WfhModule } from './wfh/wfh.module';
import { Announcement } from './entities/announcement.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot(typeOrmConfig),
        TypeOrmModule.forFeature([Announcement]),
        EventEmitterModule.forRoot(),
        AuthModule,
        EmployeeModule,
        LeaveModule,
        JobModule,
        HolidayModule,
        TimesheetModule,
        DocumentModule,
        WfhModule,
    ],
    controllers: [AppController, AnnouncementsController],
    providers: [AppService],
})
export class AppModule { }
