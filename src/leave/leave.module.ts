import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from '../entities/leave.entity';
import { LeaveApplication } from '../entities/leave-application.entity';
import { LeaveService } from '../services/leave.service';
import { LeaveController } from '../controller/leave.controller';
import { User } from 'src/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Leave, LeaveApplication, User])],
    controllers: [LeaveController],
    providers: [LeaveService],
    exports: [LeaveService],
})
export class LeaveModule { }
