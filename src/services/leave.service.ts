import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeaveApplication } from '../entities/leave-application.entity';
import { Leave } from '../entities/leave.entity';
import { User } from '../entities/user.entity';
import { ApprovalStatusEnum } from '../enum/approval-status-enum';
import { LeaveApprovedEvent } from '../events/leave-approved.event';
import { LeaveRejectedEvent } from '../events/leave-rejected.event';
import { LeaveSubmittedEvent } from '../events/leave-submitted.event';

@Injectable()
export class LeaveService {
    constructor(
        @InjectRepository(LeaveApplication)
        private leaveAppRepository: Repository<LeaveApplication>,
        @InjectRepository(Leave)
        private leaveRepository: Repository<Leave>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private eventEmitter: EventEmitter2,
    ) { }

    private isValidUUID(uuid: string): boolean {
        // More permissive UUID regex that accepts any valid hex UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    private parseDateAsUTC(dateInput: string | Date): string {
        if (!dateInput) return dateInput as string;
        
        let dateStr: string;
        if (dateInput instanceof Date) {
            dateStr = dateInput.toISOString().split('T')[0];
        } else if (typeof dateInput === 'string') {
            // Extract just the date part (YYYY-MM-DD)
            dateStr = dateInput.split('T')[0];
        } else {
            throw new BadRequestException('Invalid date format');
        }
        
        // Return as date-only string
        return dateStr;
    }

    private calculateBusinessDays(startDate: Date | string, endDate: Date | string): number {
        let count = 0;
        
        // Parse as UTC dates to avoid timezone issues
        const startStr = typeof startDate === 'string' ? startDate.split('T')[0] : startDate.toISOString().split('T')[0];
        const endStr = typeof endDate === 'string' ? endDate.split('T')[0] : endDate.toISOString().split('T')[0];
        
        const currentDate = new Date(startStr + 'T00:00:00.000Z');
        const end = new Date(endStr + 'T00:00:00.000Z');
        
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getUTCDay();
            // 0 = Sunday, 6 = Saturday
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        
        return count;
    }

    async getLeaveBalance(userId: string): Promise<any[]> {
        // Validate UUID format
        if (!this.isValidUUID(userId)) {
            throw new BadRequestException('Invalid user ID format. Expected a valid UUID.');
        }
        const leaveBalances = await this.leaveRepository.find({ where: { user_id: userId, year: new Date().getFullYear() } });
        return leaveBalances;
    }

    async getLeaveApplications(user: any, userId?: string): Promise<any[]> {
        const userLeaves = userId
            ? await this.leaveAppRepository.find({ where: { user_id: userId, user: { geo_location: user.geo_location } }, relations: ['user'], order: { applied_date: 'DESC' } })
            : await this.leaveAppRepository.find({ where: {user: {geo_location: user.geo_location }}, relations: ['user'], order: { applied_date: 'DESC' } });
        
        return userLeaves;
    }

    async applyLeave(leaveData: any): Promise<any> {
        // Validate that user exists
        const user = await this.userRepository.findOne({ 
            where: { id: leaveData.user_id } 
        });
        
        if (!user) {
            throw new NotFoundException(`User with ID ${leaveData.user_id} not found`);
        }
        
        // Parse dates explicitly as UTC date-only (no time component)
        const startDate = this.parseDateAsUTC(leaveData.start_date);
        const endDate = this.parseDateAsUTC(leaveData.end_date);
        
        const application = this.leaveAppRepository.create({
            ...leaveData,
            start_date: startDate,
            end_date: endDate,
            applied_date: new Date(),
            status: leaveData.status || 'pending',
            days_requested: this.calculateBusinessDays(startDate, endDate),
        });
        const savedApplication = await this.leaveAppRepository.save(application) as unknown as LeaveApplication;

        // Emit event for email notification to admins
        const leaveSubmittedEvent = new LeaveSubmittedEvent(
            savedApplication.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            leaveData.leave_type,
            leaveData.start_date,
            leaveData.end_date,
            savedApplication.days_requested,
            leaveData.reason,
            user.geo_location,
        );
        this.eventEmitter.emit('leave.submitted', leaveSubmittedEvent);

        return savedApplication;
    }

    async approveLeave(id: string, approverComments:string, approver: any): Promise<any> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid leave application ID format. Expected a valid UUID.');
        }
        
        // Get the leave application with user details
        const application = await this.leaveAppRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        if (!application) {
            throw new NotFoundException(`Leave application with ID ${id} not found`);
        }

        // Get user details for email
        const user = await this.userRepository.findOne({ where: { id: application.user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${application.user_id} not found`);
        }
        
        // Update application status
        await this.leaveAppRepository.update(id, {
            status: ApprovalStatusEnum.Approved,
            approved_date: new Date(), 
            approved_by: approver.id, 
            approver_name: `${approver.first_name} ${approver.last_name}`,
            approver_comments: approverComments,         
        });
        
        // Update leave balance
        const leaveBalance = await this.leaveRepository.findOne({
            where: {
                user_id: application.user_id,
                leave_type: application.leave_type
            }
        });
        
        if (leaveBalance) {
            await this.leaveRepository.save({
                id: leaveBalance.id,
                used_days: leaveBalance.used_days + application.days_requested,
                remaining_days: leaveBalance.remaining_days - application.days_requested,
                year: new Date().getFullYear(),
            });
        }

        // Emit event for email notification
        const leaveApprovedEvent = new LeaveApprovedEvent(
            application.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            application.leave_type,
            application.start_date,
            application.end_date,
            application.days_requested,
            `${approver.first_name} ${approver.last_name}`,
            approverComments || '',
        );
        this.eventEmitter.emit('leave.approved', leaveApprovedEvent);
        
        return this.leaveAppRepository.findOne({ where: { id } });
    }

    async rejectLeave(id: string, approverComments:string, approver: any): Promise<any> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid leave application ID format. Expected a valid UUID.');
        }

        // Get the leave application with user details
        const application = await this.leaveAppRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        if (!application) {
            throw new NotFoundException(`Leave application with ID ${id} not found`);
        }

        // Get user details for email
        const user = await this.userRepository.findOne({ where: { id: application.user_id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${application.user_id} not found`);
        }

        await this.leaveAppRepository.update(id, { 
            status: ApprovalStatusEnum.Rejected,  
            approved_date: new Date(), 
            approved_by: approver.id, 
            approver_name: `${approver.first_name} ${approver.last_name}`,
            approver_comments: approverComments,    
        });

        // Emit event for email notification
        const leaveRejectedEvent = new LeaveRejectedEvent(
            application.id,
            user.id,
            user.email,
            `${user.first_name} ${user.last_name}`,
            application.leave_type,
            application.start_date,
            application.end_date,
            application.days_requested,
            `${approver.first_name} ${approver.last_name}`,
            approverComments || '',
        );
        this.eventEmitter.emit('leave.rejected', leaveRejectedEvent);

        return this.leaveAppRepository.findOne({ where: { id } });
    }

    async cancelLeave(id: string, cancelReason: string, userId: string): Promise<any> {
        // Validate UUID format
        if (!this.isValidUUID(id)) {
            throw new BadRequestException('Invalid leave application ID format. Expected a valid UUID.');
        }

        // Get the leave application
        const application = await this.leaveAppRepository.findOne({ 
            where: { id },
            relations: ['user']
        });
        
        if (!application) {
            throw new NotFoundException(`Leave application with ID ${id} not found`);
        }

        // Check if the user owns this leave application
        if (application.user_id !== userId) {
            throw new UnauthorizedException('You can only cancel your own leave applications');
        }

        // Check if leave is in a cancellable state (only pending, submitted, or approved leaves can be cancelled)
        const cancellableStatuses = ['Pending', 'pending', ApprovalStatusEnum.Submitted, ApprovalStatusEnum.Approved, 'Approved', 'approved'];
        if (!cancellableStatuses.includes(application.status)) {
            throw new BadRequestException(`Cannot cancel leave with status: ${application.status}`);
        }

        // Check if the leave is approved and the start date is in the past
        const isApproved = application.status === 'Approved' || application.status === 'approved' || application.status === ApprovalStatusEnum.Approved;
        if (isApproved) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Parse the start date as UTC to avoid timezone issues (use the helper method)
            const startDateStr = this.parseDateAsUTC(application.start_date as any);
            const leaveStartDate = new Date(startDateStr + 'T00:00:00.000Z');
            
            if (leaveStartDate < today) {
                throw new BadRequestException('Cannot cancel an approved leave that has already started or is in the past');
            }
        }

        // If the leave was already approved, restore the leave balance
        if (isApproved) {
            const leaveBalance = await this.leaveRepository.findOne({
                where: {
                    user_id: application.user_id,
                    leave_type: application.leave_type
                }
            });
            
            if (leaveBalance) {
                await this.leaveRepository.save({
                    id: leaveBalance.id,
                    used_days: leaveBalance.used_days - application.days_requested,
                    remaining_days: leaveBalance.remaining_days + application.days_requested,
                    year: new Date().getFullYear(),
                });
            }
        }

        // Update application status to cancelled and update reason
        await this.leaveAppRepository.update(id, { 
            status: 'Cancelled',
            reason: cancelReason,
        });

        return this.leaveAppRepository.findOne({ where: { id } });
    }

    async createLeaveBalance(balanceData: any): Promise<any> {
        // Validate that user exists
        const user = await this.userRepository.findOne({ 
            where: { employee_id: balanceData.employee_id } 
        });
        
        if (!user) {
            throw new NotFoundException(`User with EmployeeId ${balanceData.employee_id} not found`);
        }
        
        const leave = this.leaveRepository.create(
            {
                leave_type: balanceData.leave_type, 
                user_id: user.id, 
                total_days: 10, 
                year: balanceData.year,
                remaining_days: balanceData.remaining_days, });
        const existingRecord = await this.leaveRepository.findOne({
            where: {
                user_id: user.id,
                leave_type: balanceData.leave_type,
                year: balanceData.year,
            }
        });

        if (existingRecord) {
            return this.leaveRepository.save({id: existingRecord.id, ...leave});
        }

        return this.leaveRepository.save(leave);
    }

    async generateLeaveReport(reportRequest: any, admin: any): Promise<any> {
        const { userIds = [], startDate, endDate, leaveTypes, includeBalance = true, includeApplications = true, status } = reportRequest;
        
        // Determine which users to generate reports for
        let targetUsers: User[];
        if (userIds.length === 0) {
            // Empty array means all users
            targetUsers = await this.userRepository.find({ where: { is_active: true, geo_location: admin.geo_location } });
        } else {
            // Fetch specific users
            targetUsers = await this.userRepository.find({ 
                where: { id: In(userIds), geo_location: admin.geo_location } 
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

            // Fetch leave balance if requested
            if (includeBalance) {
                const leaveBalances = await this.leaveRepository.find({ 
                    where: { user_id: user.id } 
                });
                
                report.leaveBalance = leaveBalances.map(lb => ({
                    leaveType: lb.leave_type,
                    year: lb.year,
                    totalDays: lb.total_days,
                    usedDays: lb.used_days,
                    remainingDays: lb.remaining_days,
                }));
            }

            // Fetch leave applications if requested
            if (includeApplications) {
                const applicationQuery: any = { user_id: user.id };
                
                // Apply date filters using query builder for more complex conditions
                let applications: LeaveApplication[];
                
                if (startDate && endDate) {
                    // Get applications that overlap with the date range
                    applications = await this.leaveAppRepository
                        .createQueryBuilder('leave')
                        .where('leave.user_id = :userId', { userId: user.id })
                        .andWhere('leave.start_date <= :endDate', { endDate })
                        .andWhere('leave.end_date >= :startDate', { startDate })
                        .orderBy('leave.applied_date', 'DESC')
                        .getMany();
                } else if (startDate) {
                    applications = await this.leaveAppRepository.find({
                        where: { 
                            user_id: user.id,
                            end_date: MoreThanOrEqual(new Date(startDate))
                        },
                        order: { applied_date: 'DESC' }
                    });
                } else if (endDate) {
                    applications = await this.leaveAppRepository.find({
                        where: { 
                            user_id: user.id,
                            start_date: LessThanOrEqual(new Date(endDate))
                        },
                        order: { applied_date: 'DESC' }
                    });
                } else {
                    applications = await this.leaveAppRepository.find({ 
                        where: applicationQuery,
                        order: { applied_date: 'DESC' }
                    });
                }

                // Apply additional filters
                if (leaveTypes && leaveTypes.length > 0) {
                    applications = applications.filter(app => leaveTypes.includes(app.leave_type));
                }
                
                if (status && status.length > 0) {
                    applications = applications.filter(app => status.includes(app.status));
                }

                report.leaveApplications = applications.map(app => ({
                    id: app.id,
                    leaveType: app.leave_type,
                    startDate: app.start_date,
                    endDate: app.end_date,
                    daysRequested: app.days_requested,
                    reason: app.reason,
                    status: app.status,
                    appliedDate: app.applied_date,
                    approvedBy: app.approved_by || null,
                    approverName: app.approver_name || null,
                    approvedDate: app.approved_date || null,
                    approverComments: app.approver_comments || null,
                }));

                // Generate summary statistics
                const totalApplications = applications.length;
                const approvedApplications = applications.filter(app => app.status === 'Approved').length;
                const pendingApplications = applications.filter(app => app.status === 'Pending' || app.status === 'pending').length;
                const rejectedApplications = applications.filter(app => app.status === 'Rejected').length;

                const totalDaysRequested = applications.reduce((sum, app) => sum + app.days_requested, 0);
                const totalDaysApproved = applications
                    .filter(app => app.status === 'Approved')
                    .reduce((sum, app) => sum + app.days_requested, 0);

                // Group by leave type
                const byLeaveType: any = {};
                applications.forEach(app => {
                    if (!byLeaveType[app.leave_type]) {
                        byLeaveType[app.leave_type] = {
                            applications: 0,
                            daysRequested: 0,
                            daysApproved: 0,
                        };
                    }
                    byLeaveType[app.leave_type].applications++;
                    byLeaveType[app.leave_type].daysRequested += app.days_requested;
                    if (app.status === 'Approved') {
                        byLeaveType[app.leave_type].daysApproved += app.days_requested;
                    }
                });

                report.summary = {
                    totalApplications,
                    approvedApplications,
                    pendingApplications,
                    rejectedApplications,
                    totalDaysRequested,
                    totalDaysApproved,
                    byLeaveType,
                };
            }

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
