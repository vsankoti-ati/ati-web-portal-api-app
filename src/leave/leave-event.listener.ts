import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LeaveApprovedEvent } from '../events/leave-approved.event';
import { LeaveRejectedEvent } from '../events/leave-rejected.event';
import { LeaveSubmittedEvent } from '../events/leave-submitted.event';
import { EmailService } from '../auth/email.service';

@Injectable()
export class LeaveEventListener {
    private readonly logger = new Logger(LeaveEventListener.name);

    constructor(private readonly emailService: EmailService) {}

    @OnEvent('leave.approved')
    async handleLeaveApprovedEvent(event: LeaveApprovedEvent) {
        this.logger.log(`Handling leave approved event for user: ${event.userName}`);
        
        try {
            await this.emailService.sendLeaveApprovedEmail(
                event.userEmail,
                event.userName,
                event.leaveType,
                event.startDate,
                event.endDate,
                event.daysRequested,
                event.approved_by,
                event.approverComments,
            );
            
            this.logger.log(`Leave approved email sent successfully to ${event.userEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send leave approved email to ${event.userEmail}:`, error);
        }
    }

    @OnEvent('leave.rejected')
    async handleLeaveRejectedEvent(event: LeaveRejectedEvent) {
        this.logger.log(`Handling leave rejected event for user: ${event.userName}`);
        
        try {
            await this.emailService.sendLeaveRejectedEmail(
                event.userEmail,
                event.userName,
                event.leaveType,
                event.startDate,
                event.endDate,
                event.daysRequested,
                event.approverName,
                event.approverComments,
            );
            
            this.logger.log(`Leave rejected email sent successfully to ${event.userEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send leave rejected email to ${event.userEmail}:`, error);
        }
    }

    @OnEvent('leave.submitted')
    async handleLeaveSubmittedEvent(event: LeaveSubmittedEvent) {
        this.logger.log(`Handling leave submitted event for user: ${event.submitterName}`);
        
        try {
            await this.emailService.sendLeaveSubmittedEmailToAdmins(
                event.submitterName,
                event.submitterEmail,
                event.leaveType,
                event.startDate,
                event.endDate,
                event.daysRequested,
                event.reason,
                event.submitterGeoLocation,
            );
            
            this.logger.log(`Leave submitted emails sent successfully to admins`);
        } catch (error) {
            this.logger.error(`Failed to send leave submitted emails to admins:`, error);
        }
    }
}
