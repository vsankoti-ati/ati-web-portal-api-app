import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';

@Controller('announcements')
@UseGuards(AuthGuard('jwt'))
export class AnnouncementsController {
    constructor(
        @InjectRepository(Announcement)
        private announcementRepository: Repository<Announcement>,
    ) { }

    @Get()
    async getAnnouncements() {
        return this.announcementRepository.find({
            take: 10,
            order: { created_at: 'DESC' }
        });
    }
}
