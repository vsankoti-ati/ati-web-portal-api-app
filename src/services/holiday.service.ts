import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolidayCalendar } from '../entities/holiday-calendar.entity';

@Injectable()
export class HolidayService {
    constructor(
        @InjectRepository(HolidayCalendar)
        private holidayRepository: Repository<HolidayCalendar>,
    ) { }

    async getAllHolidays(year?: number, client?: string): Promise<any[]> {
        const where: any = {};
        if (year) where.year = year;
        if (client) where.client = client;
        return this.holidayRepository.find({ where });
    }

    async createHoliday(holidayData: any): Promise<any> {
        const holiday = this.holidayRepository.create(holidayData);
        
        return this.holidayRepository.save(holiday);
    }

    async deleteHoliday(id: string): Promise<void> {
        await this.holidayRepository.delete(id);
    }
}
