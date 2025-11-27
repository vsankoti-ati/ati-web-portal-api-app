import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timesheet } from '../entities/timesheet.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Project } from '../entities/project.entity';
import { MockDataService } from './mock-data.service';

@Injectable()
export class TimesheetService {
    constructor(
        @InjectRepository(Timesheet)
        private timesheetRepository: Repository<Timesheet>,
        @InjectRepository(TimeEntry)
        private timeEntryRepository: Repository<TimeEntry>,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        private mockDataService: MockDataService,
    ) { }

    async getTimesheets(employeeId?: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const timesheets = this.mockDataService.getMockData('timesheets');
            return employeeId ? timesheets.filter((t) => t.employee_id === employeeId) : timesheets;
        }
        return employeeId
            ? this.timesheetRepository.find({ where: { employee_id: employeeId } })
            : this.timesheetRepository.find();
    }

    async getTimesheet(id: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const timesheets = this.mockDataService.getMockData('timesheets');
            const timesheet = timesheets.find((t) => t.id === id);
            if (timesheet) {
                const entries = this.mockDataService.getMockData('time-entries').filter((e) => e.timesheet_id === id);
                return { ...timesheet, entries };
            }
            return null;
        }
        const timesheet = await this.timesheetRepository.findOne({ where: { id } });
        if (timesheet) {
            const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id } });
            return { ...timesheet, entries };
        }
        return null;
    }

    async createTimesheet(timesheetData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const timesheets = this.mockDataService.getMockData('timesheets');
            const newTimesheet = {
                id: `ts-${Date.now()}`,
                ...timesheetData,
                status: 'draft',
                submission_date: null,
                approval_date: null,
            };
            timesheets.push(newTimesheet);
            await this.mockDataService.saveMockData('timesheets', timesheets);
            return newTimesheet;
        }
        const timesheet = this.timesheetRepository.create(timesheetData);
        return this.timesheetRepository.save(timesheet);
    }

    async addTimeEntry(entryData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const entries = this.mockDataService.getMockData('time-entries');
            const newEntry = { id: `te-${Date.now()}`, ...entryData };
            entries.push(newEntry);
            await this.mockDataService.saveMockData('time-entries', entries);
            return newEntry;
        }
        const entry = this.timeEntryRepository.create(entryData);
        return this.timeEntryRepository.save(entry);
    }

    async submitTimesheet(id: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const timesheets = this.mockDataService.getMockData('timesheets');
            const timesheet = timesheets.find((t) => t.id === id);
            if (timesheet) {
                timesheet.status = 'submitted';
                timesheet.submission_date = new Date().toISOString().split('T')[0];
                await this.mockDataService.saveMockData('timesheets', timesheets);
            }
            return timesheet;
        }
        await this.timesheetRepository.update(id, { status: 'submitted', submission_date: new Date() });
        return this.timesheetRepository.findOne({ where: { id } });
    }

    async approveTimesheet(id: string, approverId: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const timesheets = this.mockDataService.getMockData('timesheets');
            const timesheet = timesheets.find((t) => t.id === id);
            if (timesheet) {
                timesheet.status = 'approved';
                timesheet.approval_date = new Date().toISOString().split('T')[0];
                timesheet.approved_by_employee_id = approverId;
                await this.mockDataService.saveMockData('timesheets', timesheets);
            }
            return timesheet;
        }
        await this.timesheetRepository.update(id, {
            status: 'approved',
            approval_date: new Date(),
            approved_by_employee_id: approverId,
        });
        return this.timesheetRepository.findOne({ where: { id } });
    }

    async getAllProjects(): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            return this.mockDataService.getMockData('projects');
        }
        return this.projectRepository.find();
    }

    async createProject(projectData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const projects = this.mockDataService.getMockData('projects');
            const newProject = {
                id: `proj-${Date.now()}`,
                ...projectData,
                created_at: new Date().toISOString(),
            };
            projects.push(newProject);
            await this.mockDataService.saveMockData('projects', projects);
            return newProject;
        }
        const project = this.projectRepository.create(projectData);
        return this.projectRepository.save(project);
    }

    async getProject(id: string): Promise<any> {
    if (process.env.USE_MOCK_DATA === 'true') {
        const projects = this.mockDataService.getMockData('projects');
        return projects.find((p) => p.id === id);
    }
    return this.projectRepository.findOne({ where: { id } });
}

async updateProject(id: string, projectData: any): Promise<any> {
    if (process.env.USE_MOCK_DATA === 'true') {
        const projects = this.mockDataService.getMockData('projects');
        const projectIndex = projects.findIndex((p) => p.id === id);
        if (projectIndex > -1) {
            projects[projectIndex] = { ...projects[projectIndex], ...projectData };
            await this.mockDataService.saveMockData('projects', projects);
            return projects[projectIndex];
        }
        return null;
    }
    await this.projectRepository.update(id, projectData);
    return this.projectRepository.findOne({ where: { id } });
}


}
