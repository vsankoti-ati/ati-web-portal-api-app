import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TimesheetApprovedEvent } from '../events/timesheet-approved.event';
import { TimesheetRejectedEvent } from '../events/timesheet-rejected.event';
import { TimesheetSubmittedEvent } from '../events/timesheet-submitted.event';
import { EmailService } from '../auth/email.service';

@Injectable()
export class TimesheetEventListener {
    private readonly logger = new Logger(TimesheetEventListener.name);

    constructor(private readonly emailService: EmailService) {}

    @OnEvent('timesheet.approved')
    async handleTimesheetApprovedEvent(event: TimesheetApprovedEvent) {
        this.logger.log(`Handling timesheet approved event for user: ${event.userName}`);
        
        try {
            await this.emailService.sendTimesheetApprovedEmail(
                event.userEmail,
                event.userName,
                event.weekStartDate,
                event.weekEndDate,
                event.approverName,
                event.approverComments,
            );
            
            this.logger.log(`Timesheet approved email sent successfully to ${event.userEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send timesheet approved email to ${event.userEmail}:`, error);
        }
    }

    @OnEvent('timesheet.rejected')
    async handleTimesheetRejectedEvent(event: TimesheetRejectedEvent) {
        this.logger.log(`Handling timesheet rejected event for user: ${event.userName}`);
        
        try {
            await this.emailService.sendTimesheetRejectedEmail(
                event.userEmail,
                event.userName,
                event.weekStartDate,
                event.weekEndDate,
                event.approverName,
                event.approverComments,
            );
            
            this.logger.log(`Timesheet rejected email sent successfully to ${event.userEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send timesheet rejected email to ${event.userEmail}:`, error);
        }
    }

    @OnEvent('timesheet.submitted')
    async handleTimesheetSubmittedEvent(event: TimesheetSubmittedEvent) {
        this.logger.log(`Handling timesheet submitted event for user: ${event.submitterName}`);
        
        try {
            await this.emailService.sendTimesheetSubmittedEmailToAdmins(
                event.submitterName,
                event.submitterEmail,
                event.weekStartDate,
                event.weekEndDate,
                event.submitterGeoLocation,
            );
            
            this.logger.log(`Timesheet submitted emails sent successfully to admins`);
        } catch (error) {
            this.logger.error(`Failed to send timesheet submitted emails to admins:`, error);
        }
    }
}
