import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TimesheetService } from '../services/timesheet.service';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectController {
    constructor(private readonly timesheetService: TimesheetService) { }

    @Get()
    async getAllProjects() {
        return this.timesheetService.getAllProjects();
    }

    @Get(':id')
    async getProject(@Param('id') id: string) {
        return this.timesheetService.getProject(id);
    }

    @Post()
    async createProject(@Body() projectData: any) {
        return this.timesheetService.createProject(projectData);
    }

    @Put(':id')
    async updateProject(@Param('id') id: string, @Body() projectData: any) {
        return this.timesheetService.updateProject(id, projectData);
    }
}
