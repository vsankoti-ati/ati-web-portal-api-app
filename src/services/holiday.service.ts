import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HolidayCalendar } from '../entities/holiday-calendar.entity';
import { MockDataService } from './mock-data.service';

@Injectable()
export class HolidayService {
    constructor(
        @InjectRepository(HolidayCalendar)
        private holidayRepository: Repository<HolidayCalendar>,
        private mockDataService: MockDataService,
    ) { }

    async getAllHolidays(year?: number, client?: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            let holidays = this.mockDataService.getMockData('holidays');
            if (year) {
                holidays = holidays.filter((h) => h.year === year);
            }
            if (client) {
                holidays = holidays.filter((h) => h.client === client || h.client === 'General');
            }
            return holidays;
        }
        const where: any = {};
        if (year) where.year = year;
        if (client) where.client = client;
        return this.holidayRepository.find({ where });
    }

    async createHoliday(holidayData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const holidays = this.mockDataService.getMockData('holidays');
            const newHoliday = { id: `hol-${Date.now()}`, ...holidayData };
            holidays.push(newHoliday);
            await this.mockDataService.saveMockData('holidays', holidays);
            return newHoliday;
        }
        const holiday = this.holidayRepository.create(holidayData);
        return this.holidayRepository.save(holiday);
    }

    async deleteHoliday(id: string): Promise<void> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const holidays = this.mockDataService.getMockData('holidays');
            const filtered = holidays.filter((h) => h.id !== id);
            await this.mockDataService.saveMockData('holidays', filtered);
            return;
        }
        await this.holidayRepository.delete(id);
    }
}
