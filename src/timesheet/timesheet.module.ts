import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Timesheet } from '../entities/timesheet.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Project } from '../entities/project.entity';
import { TimesheetService } from '../services/timesheet.service';
import { TimesheetController } from '../controller/timesheet.controller';
import { ProjectController } from '../controller/project.controller';
import { MockDataModule } from '../services/mock-data.module';

@Module({
    imports: [TypeOrmModule.forFeature([Timesheet, TimeEntry, Project]), MockDataModule],
    controllers: [TimesheetController, ProjectController],
    providers: [TimesheetService],
    exports: [TimesheetService],
})
export class TimesheetModule { }
