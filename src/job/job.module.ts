import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOpening } from '../entities/job-opening.entity';
import { Candidate } from '../entities/candidate.entity';
import { JobReferral } from '../entities/job-referral.entity';
import { JobService } from '../services/job.service';
import { JobController } from '../controller/job.controller';
import { MockDataModule } from '../services/mock-data.module';

@Module({
    imports: [TypeOrmModule.forFeature([JobOpening, Candidate, JobReferral]), MockDataModule],
    controllers: [JobController],
    providers: [JobService],
    exports: [JobService],
})
export class JobModule { }
