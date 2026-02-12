import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timesheet } from '../entities/timesheet.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Project } from '../entities/project.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class TimesheetService {
    constructor(
        @InjectRepository(Timesheet)
        private timesheetRepository: Repository<Timesheet>,
        @InjectRepository(TimeEntry)
        private timeEntryRepository: Repository<TimeEntry>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async getTimesheets(userId?: string): Promise<any[]> {
        if(userId) {
            const timesheets = await this.timesheetRepository.find({ 
                where: { user_id: userId },
                relations: ['user']
            });
            timesheets.forEach((t:any) => {
                t.submitter = t.user ? `${t.user.first_name} ${t.user.last_name}` : 'Unknown';
            });
            return timesheets;
        } else {
            const timesheets = await this.timesheetRepository.find({
                relations: ['user']
            });
            timesheets.forEach((t:any) => {
                t.submitter = t.user ? `${t.user.first_name} ${t.user.last_name}` : 'Unknown';
            });
            return timesheets;
        }
    }

    async getTimesheet(id: string): Promise<any> {
        const timesheet = await this.timesheetRepository.findOne({ where: { id } });
        if (timesheet) {
            const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });
            return { ...timesheet, entries };
        }
        return null;
    }

    async createTimesheet(timesheetData: any): Promise<any> {
        const timesheet = this.timesheetRepository.create(timesheetData);
        return this.timesheetRepository.save(timesheet);
    }

    async addTimeEntry(entryData: any): Promise<any> {
        const entry = this.timeEntryRepository.create(entryData);
        return this.timeEntryRepository.save(entry);
    }

    async submitTimesheet(id: string): Promise<any> {
        await this.timesheetRepository.update(id, { status: 'submitted', submission_date: new Date() });
        const timesheet = await this.timesheetRepository.findOne({ where: { id } });
        const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });
        return { ...timesheet, entries };
    }

    async approveTimesheet(id: string, approverId: string): Promise<any> {
        await this.timesheetRepository.update(id, {
            status: 'approved',
            approval_date: new Date(),
            approved_by_employee_id: approverId,
        });

        const timesheet = await this.timesheetRepository.findOne({ where: { id } });
        const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });
        return { ...timesheet, entries };    
        
    }

    async rejectTimesheet(id: string, rejectedBy: string): Promise<any> {
        await this.timesheetRepository.update(id, {
            status: 'rejected',
            approved_by_employee_id: rejectedBy,
        });

        const timesheet = await this.timesheetRepository.findOne({ where: { id } });
        const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });
        return { ...timesheet, entries };
    }

    async getAllProjects(): Promise<any[]> {
        return this.projectRepository.find();
    }

    async createProject(projectData: any): Promise<any> {
        const project = this.projectRepository.create(projectData);
        return this.projectRepository.save(project);
    }

    async getProject(id: string): Promise<any> {
        return this.projectRepository.findOne({ where: { id } });
    }

    async updateProject(id: string, projectData: any): Promise<any> {
        await this.projectRepository.update(id, projectData);
        return this.projectRepository.findOne({ where: { id } });
    }


}
