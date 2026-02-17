import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkFromHomeRequest } from '../entities/work-from-home-request.entity';
import { User } from '../entities/user.entity';
import { WfhService } from '../services/wfh.service';
import { WfhController } from '../controller/wfh.controller';
import { WfhEventListener } from './wfh-event.listener';
import { EmailService } from '../auth/email.service';

@Module({
    imports: [TypeOrmModule.forFeature([WorkFromHomeRequest, User])],
    controllers: [WfhController],
    providers: [WfhService, WfhEventListener, EmailService],
    exports: [WfhService],
})
export class WfhModule { }
