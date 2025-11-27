import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MockDataService } from '../services/mock-data.service';

@Controller('announcements')
@UseGuards(AuthGuard('jwt'))
export class AnnouncementsController {
    constructor(private mockDataService: MockDataService) { }

    @Get()
    getAnnouncements() {
        const announcements = this.mockDataService.getMockData('announcements');
        return announcements.filter((a) => a.is_active).slice(0, 10);
    }
}
