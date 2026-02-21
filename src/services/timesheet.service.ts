import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual, LessThanOrEqual, Between, ILike, Not } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Timesheet } from '../entities/timesheet.entity';
import { TimeEntry } from '../entities/time-entry.entity';
import { Project } from '../entities/project.entity';
import { User } from 'src/entities/user.entity';
import { ApprovalStatusEnum } from '../enum/approval-status-enum';
import { TimesheetApprovedEvent } from '../events/timesheet-approved.event';
import { TimesheetRejectedEvent } from '../events/timesheet-rejected.event';
import { TimesheetSubmittedEvent } from '../events/timesheet-submitted.event';

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
        private eventEmitter: EventEmitter2,
    ) { }

    async getTimesheets(loggedInUser: any, userId?: string): Promise<any[]> {
        // Calculate date 3 months ago
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if(userId) {
            const timesheets = await this.timesheetRepository.find({ 
                where: { 
                    user_id: userId, 
                    status: Not(ILike(`%${ApprovalStatusEnum.Cancelled}%`)),
                    week_start_date: MoreThanOrEqual(threeMonthsAgo)
                },
                relations: ['user'],
                order: { week_start_date: 'DESC' }
            });
            timesheets.forEach((t:any) => {
                t.submitter = t.user ? `${t.user.first_name} ${t.user.last_name}` : 'Unknown';
            });
            return timesheets;
        } else {
            const timesheets = await this.timesheetRepository.find({
                relations: ['user'],
                where: { 
                    user: { geo_location: loggedInUser.geo_location }, 
                    status: Not(ILike(`%${ApprovalStatusEnum.Cancelled}%`)),
                    week_start_date: MoreThanOrEqual(threeMonthsAgo)
                },
                order: { week_start_date: 'DESC' }
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
        // Get timesheet with user details
        const timesheet = await this.timesheetRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        if (!timesheet) {
            throw new NotFoundException(`Timesheet with ID ${id} not found`);
        }

        const user = await this.userRepository.findOne({ where: { id: timesheet.user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${timesheet.user_id} not found`);
        }

        await this.timesheetRepository.update(id, { status: ApprovalStatusEnum.Submitted, submission_date: new Date() });
        const updatedTimesheet = await this.timesheetRepository.findOne({ where: { id } });
        const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });

        // Emit event for email notification to admins
        const timesheetSubmittedEvent = new TimesheetSubmittedEvent(
            updatedTimesheet.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            updatedTimesheet.week_start_date,
            updatedTimesheet.week_end_date,
            user.geo_location,
        );
        this.eventEmitter.emit('timesheet.submitted', timesheetSubmittedEvent);

        return { ...updatedTimesheet, entries };
    }

    async approveTimesheet(id: string, approver_comments: string, approverId: string): Promise<any> {
        // Get the timesheet with user details before updating
        const timesheet = await this.timesheetRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        if (!timesheet) {
            throw new NotFoundException(`Timesheet with ID ${id} not found`);
        }

        // Get user details for email
        const user = await this.userRepository.findOne({ where: { id: timesheet.user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${timesheet.user_id} not found`);
        }

        // Get approver details
        const approver = await this.userRepository.findOne({ where: { id: approverId } });
        const approverName = approver ? `${approver.first_name} ${approver.last_name}` : 'Admin';

        await this.timesheetRepository.update(id, {
            status: ApprovalStatusEnum.Approved,
            approval_date: new Date(),
            approved_by_employee_id: approverId,
            approver_comments: approver_comments,
        });

        const updatedTimesheet = await this.timesheetRepository.findOne({ where: { id } });
        const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });

        // Emit event for email notification
        const timesheetApprovedEvent = new TimesheetApprovedEvent(
            timesheet.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            timesheet.week_start_date,
            timesheet.week_end_date,
            approverName,
            approver_comments || '',
        );
        this.eventEmitter.emit('timesheet.approved', timesheetApprovedEvent);

        return { ...updatedTimesheet, entries };    
    }

    async rejectTimesheet(id: string, approver_comments: string, rejectedBy: string): Promise<any> {
        // Get the timesheet with user details before updating
        const timesheet = await this.timesheetRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        if (!timesheet) {
            throw new NotFoundException(`Timesheet with ID ${id} not found`);
        }

        // Get user details for email
        const user = await this.userRepository.findOne({ where: { id: timesheet.user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${timesheet.user_id} not found`);
        }

        // Get approver details
        const approver = await this.userRepository.findOne({ where: { id: rejectedBy } });
        const approverName = approver ? `${approver.first_name} ${approver.last_name}` : 'Admin';

        await this.timesheetRepository.update(id, {
            status: ApprovalStatusEnum.Rejected,
            approved_by_employee_id: rejectedBy,
            approver_comments: approver_comments,
            approval_date: new Date(),
        });

        const updatedTimesheet = await this.timesheetRepository.findOne({ where: { id } });
        const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });

        // Emit event for email notification
        const timesheetRejectedEvent = new TimesheetRejectedEvent(
            timesheet.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            timesheet.week_start_date,
            timesheet.week_end_date,
            approverName,
            approver_comments || '',
        );
        this.eventEmitter.emit('timesheet.rejected', timesheetRejectedEvent);

        return { ...updatedTimesheet, entries };
    }

    async cancelTimesheet(id: string, cancelReason: string, userId: string): Promise<any> {
        // Get the timesheet
        const timesheet = await this.timesheetRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        
        if (!timesheet) {
            throw new NotFoundException(`Timesheet with ID ${id} not found`);
        }

        // Check if the user owns this timesheet
        if (timesheet.user_id !== userId) {
            throw new UnauthorizedException('You can only cancel your own timesheets');
        }

        // Check if timesheet is in a cancellable state
        const cancellableStatuses = ['draft', 'submitted', 'approved', ApprovalStatusEnum.Draft, ApprovalStatusEnum.Submitted, ApprovalStatusEnum.Approved];
        if (!cancellableStatuses.includes(timesheet.status)) {
            throw new BadRequestException(`Cannot cancel timesheet with status: ${timesheet.status}`);
        }

        // Check if the timesheet is approved and the week has already started
        const isApproved = timesheet.status === 'approved' || timesheet.status === ApprovalStatusEnum.Approved;
        if (isApproved) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Parse the week start date
            const weekStartDate = timesheet.week_start_date instanceof Date 
                ? timesheet.week_start_date 
                : new Date(timesheet.week_start_date);
            weekStartDate.setHours(0, 0, 0, 0);
            
            if (weekStartDate < today) {
                throw new BadRequestException('Cannot cancel an approved timesheet for a week that has already started or is in the past');
            }
        }

        // Update timesheet status to cancelled
        await this.timesheetRepository.update(id, { 
            status: 'cancelled',
            approver_comments: cancelReason,
        });

        const updatedTimesheet = await this.timesheetRepository.findOne({ where: { id }  });
        const entries = await this.timeEntryRepository.find({ where: { timesheet_id: id }, relations: ['project'] });

        return { ...updatedTimesheet, entries };
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

    async generateTimesheetReport(reportRequest: any, admin: any): Promise<any> {
        const { 
            userIds = [], 
            startDate, 
            endDate, 
            status, 
            projectIds, 
            includeEntries = true, 
            groupBy = 'week' 
        } = reportRequest;
        
        // Determine which users to generate reports for
        let targetUsers: User[];
        if (userIds.length === 0) {
            // Empty array means all users
            targetUsers = await this.userRepository.find({ where: { is_active: true, geo_location: admin.geo_location } });
        } else {
            // Fetch specific users
            targetUsers = await this.userRepository.find({ 
                where: { id: In(userIds), geo_location: admin.geo_location },                
            });
            
            // Validate all user IDs exist
            if (targetUsers.length !== userIds.length) {
                const foundIds = targetUsers.map(u => u.id);
                const notFoundIds = userIds.filter(id => !foundIds.includes(id));
                throw new NotFoundException(`Users not found: ${notFoundIds.join(', ')}`);
            }
        }

        const userReports = [];

        for (const user of targetUsers) {
            const report: any = {
                user: {
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    employeeId: user.employee_id || null,
                },
                reportPeriod: {
                    startDate: startDate || null,
                    endDate: endDate || null,
                },
            };

            // Build timesheet query
            const timesheetQuery: any = { user_id: user.id };
            
            // Apply date filters using query builder for proper date range handling
            let timesheets: Timesheet[];
            
            if (startDate && endDate) {
                // Get timesheets that overlap with the date range
                timesheets = await this.timesheetRepository
                    .createQueryBuilder('timesheet')
                    .where('timesheet.user_id = :userId', { userId: user.id })
                    .andWhere('timesheet.week_start_date <= :endDate', { endDate })
                    .andWhere('timesheet.week_end_date >= :startDate', { startDate })
                    .orderBy('timesheet.week_start_date', 'DESC')
                    .getMany();
            } else if (startDate) {
                timesheets = await this.timesheetRepository.find({
                    where: { 
                        user_id: user.id,
                        week_end_date: MoreThanOrEqual(new Date(startDate))
                    },
                    order: { week_start_date: 'DESC' }
                });
            } else if (endDate) {
                timesheets = await this.timesheetRepository.find({
                    where: { 
                        user_id: user.id,
                        week_start_date: LessThanOrEqual(new Date(endDate))
                    },
                    order: { week_start_date: 'DESC' }
                });
            } else {
                timesheets = await this.timesheetRepository.find({ 
                    where: timesheetQuery,
                    order: { week_start_date: 'DESC' }
                });
            }

            // Apply status filter
            if (status && status.length > 0) {
                timesheets = timesheets.filter(ts => status.includes(ts.status));
            }

            // Fetch time entries and calculate hours for each timesheet
            const timesheetDetails = [];
            let totalHours = 0;
            let approvedHours = 0;
            const projectHoursMap: Map<string, { projectId: string, projectName: string, hours: number, count: number }> = new Map();

            for (const timesheet of timesheets) {
                const entries = await this.timeEntryRepository.find({ 
                    where: { timesheet_id: timesheet.id },
                    relations: ['project']
                });

                // Filter by project if requested
                let filteredEntries = entries;
                if (projectIds && projectIds.length > 0) {
                    filteredEntries = entries.filter(entry => projectIds.includes(entry.project_id));
                    // Skip this timesheet if no matching entries after filtering
                    if (filteredEntries.length === 0) continue;
                }

                const timesheetHours = filteredEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);
                totalHours += timesheetHours;

                if (timesheet.status === 'approved') {
                    approvedHours += timesheetHours;
                }

                // Aggregate by project
                filteredEntries.forEach(entry => {
                    const projectKey = entry.project_id;
                    const projectName = entry.project?.name || 'Unknown Project';
                    
                    if (!projectHoursMap.has(projectKey)) {
                        projectHoursMap.set(projectKey, {
                            projectId: projectKey,
                            projectName: projectName,
                            hours: 0,
                            count: 0
                        });
                    }
                    
                    const projectData = projectHoursMap.get(projectKey);
                    projectData.hours += Number(entry.hours);
                    projectData.count++;
                });

                const timesheetDetail: any = {
                    id: timesheet.id,
                    weekStartDate: timesheet.week_start_date,
                    weekEndDate: timesheet.week_end_date,
                    status: timesheet.status,
                    submissionDate: timesheet.submission_date || null,
                    approvalDate: timesheet.approval_date || null,
                    approvedByEmployeeId: timesheet.approved_by_employee_id || null,
                    approverComments: timesheet.approver_comments || null,
                    totalHours: timesheetHours,
                };

                if (includeEntries) {
                    timesheetDetail.timeEntries = filteredEntries.map(entry => ({
                        id: entry.id,
                        projectId: entry.project_id,
                        projectName: entry.project?.name || 'Unknown Project',
                        entryDate: entry.entry_date,
                        hours: Number(entry.hours),
                        description: entry.description || null,
                    }));
                }

                timesheetDetails.push(timesheetDetail);
            }

            report.timesheets = timesheetDetails;

            // Generate summary statistics
            const totalTimesheets = timesheetDetails.length;
            const approvedTimesheets = timesheetDetails.filter(ts => ts.status === 'approved').length;
            const submittedTimesheets = timesheetDetails.filter(ts => ts.status === 'submitted').length;
            const draftTimesheets = timesheetDetails.filter(ts => ts.status === 'draft').length;

            const averageHoursPerWeek = totalTimesheets > 0 ? totalHours / totalTimesheets : 0;

            // Convert project map to array
            const byProject = Array.from(projectHoursMap.values()).map(p => ({
                projectId: p.projectId,
                projectName: p.projectName,
                totalHours: Number(p.hours.toFixed(2)),
                timesheetCount: p.count
            }));

            // Group by month if requested
            const byMonth: any[] = [];
            if (groupBy === 'month' || groupBy === 'week') {
                const monthMap: Map<string, { totalHours: number, timesheetCount: number }> = new Map();
                
                timesheetDetails.forEach(ts => {
                    const date = new Date(ts.weekStartDate);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!monthMap.has(monthKey)) {
                        monthMap.set(monthKey, { totalHours: 0, timesheetCount: 0 });
                    }
                    
                    const monthData = monthMap.get(monthKey);
                    monthData.totalHours += ts.totalHours;
                    monthData.timesheetCount++;
                });

                for (const [month, data] of monthMap.entries()) {
                    byMonth.push({
                        month,
                        totalHours: Number(data.totalHours.toFixed(2)),
                        timesheetCount: data.timesheetCount
                    });
                }
                
                byMonth.sort((a, b) => a.month.localeCompare(b.month));
            }

            report.summary = {
                totalTimesheets,
                approvedTimesheets,
                submittedTimesheets,
                draftTimesheets,
                totalHours: Number(totalHours.toFixed(2)),
                approvedHours: Number(approvedHours.toFixed(2)),
                averageHoursPerWeek: Number(averageHoursPerWeek.toFixed(2)),
                byProject,
                byMonth,
            };

            userReports.push(report);
        }

        return {
            success: true,
            data: {
                reports: userReports,
                generatedAt: new Date(),
                generatedBy: {
                    userId: admin.userId || admin.id,
                    username: admin.username || admin.name,
                    role: admin.role,
                },
                totalUsers: userReports.length,
            },
        };
    }

}