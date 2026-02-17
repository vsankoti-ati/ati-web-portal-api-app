import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WfhApprovedEvent } from '../events/wfh-approved.event';
import { WfhRejectedEvent } from '../events/wfh-rejected.event';
import { WfhSubmittedEvent } from '../events/wfh-submitted.event';
import { EmailService } from '../auth/email.service';

@Injectable()
export class WfhEventListener {
    private readonly logger = new Logger(WfhEventListener.name);

    constructor(private readonly emailService: EmailService) {}

    @OnEvent('wfh.approved')
    async handleWfhApprovedEvent(event: WfhApprovedEvent) {
        this.logger.log(`Handling WFH approved event for user: ${event.userName}`);
        
        try {
            await this.emailService.sendWfhApprovedEmail(
                event.userEmail,
                event.userName,
                event.startDate,
                event.endDate,
                event.reason,
                event.approverName,
                event.approverComments,
            );
            
            this.logger.log(`WFH approved email sent successfully to ${event.userEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send WFH approved email to ${event.userEmail}:`, error);
        }
    }

    @OnEvent('wfh.rejected')
    async handleWfhRejectedEvent(event: WfhRejectedEvent) {
        this.logger.log(`Handling WFH rejected event for user: ${event.userName}`);
        
        try {
            await this.emailService.sendWfhRejectedEmail(
                event.userEmail,
                event.userName,
                event.startDate,
                event.endDate,
                event.reason,
                event.approverName,
                event.approverComments,
            );
            
            this.logger.log(`WFH rejected email sent successfully to ${event.userEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send WFH rejected email to ${event.userEmail}:`, error);
        }
    }

    @OnEvent('wfh.submitted')
    async handleWfhSubmittedEvent(event: WfhSubmittedEvent) {
        this.logger.log(`Handling WFH submitted event for user: ${event.submitterName}`);
        
        try {
            await this.emailService.sendWfhSubmittedEmailToAdmins(
                event.submitterName,
                event.submitterEmail,
                event.startDate,
                event.endDate,
                event.reason,
                event.submitterGeoLocation,
            );
            
            this.logger.log(`WFH submitted emails sent successfully to admins`);
        } catch (error) {
            this.logger.error(`Failed to send WFH submitted emails to admins:`, error);
        }
    }
}
