import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidayCalendar } from '../entities/holiday-calendar.entity';
import { HolidayService } from '../services/holiday.service';
import { HolidayController } from '../controller/holiday.controller';

@Module({
    imports: [TypeOrmModule.forFeature([HolidayCalendar])],
    controllers: [HolidayController],
    providers: [HolidayService],
    exports: [HolidayService],
})
export class HolidayModule { }
