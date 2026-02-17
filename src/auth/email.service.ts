import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import { User } from '../entities/user.entity';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private emailClient: EmailClient | null = null;
    private isDevelopment: boolean;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        // Check if in development mode (default to development if not set)
        this.isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
        
        this.logger.log(`Email Service initialized in ${this.isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);

        // Only initialize Azure Email Client in production
        if (!this.isDevelopment) {
            const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
            if (connectionString) {
                this.emailClient = new EmailClient(connectionString);
                this.logger.log('Azure Email Client initialized successfully');
            } else {
                this.logger.warn('AZURE_COMMUNICATION_CONNECTION_STRING not set. Email functionality will not work in production.');
            }
        } else {
            this.logger.log('Development mode: Emails will be logged to console instead of being sent');
        }
    }

    async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
        const resetLink = `${process.env.ATI_PORTAL_BASE_URL}reset-password?token=${resetToken}`;

        // DEVELOPMENT MODE: Log to console instead of sending email
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 PASSWORD RESET EMAIL (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`To: ${email}`);
            this.logger.log(`Reset Link: ${resetLink}`);
            this.logger.log(`Reset Token: ${resetToken}`);
            this.logger.log(`Expires: 1 hour from now`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send via Azure Communication Services
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        const emailMessage: EmailMessage = {
            senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
            content: {
                subject: 'Password Reset Request',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .button {
                                display: inline-block;
                                padding: 12px 24px;
                                background-color: #007bff;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 4px;
                                margin: 20px 0;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Password Reset Request</h2>
                            <p>We received a request to reset your password. Click the button below to reset it:</p>
                            <a href="${resetLink}" class="button">Reset Password</a>
                            <p>Or copy and paste this link into your browser:</p>
                            <p>${resetLink}</p>
                            <p>This link will expire in 1 hour.</p>
                            <p>If you didn't request a password reset, please ignore this email.</p>
                            <div class="footer">
                                <p>This is an automated email, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            },
            recipients: {
                to: [{ address: email }],
            },
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            this.logger.log(`Password reset email sent to ${email}`);
        } catch (error) {
            this.logger.error('Error sending email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    async sendLeaveApprovedEmail(
        email: string,
        userName: string,
        leaveType: string,
        startDate: Date,
        endDate: Date,
        daysRequested: number,
        approverName: string,
        approverComments: string,
    ): Promise<void> {
        // DEVELOPMENT MODE: Log to console instead of sending email
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 LEAVE APPROVED EMAIL (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`To: ${email}`);
            this.logger.log(`User: ${userName}`);
            this.logger.log(`Leave Type: ${leaveType}`);
            this.logger.log(`Period: ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`);
            this.logger.log(`Days: ${daysRequested}`);
            this.logger.log(`Approved By: ${approverName}`);
            this.logger.log(`Comments: ${approverComments || 'None'}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send via Azure Communication Services
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        const emailMessage: EmailMessage = {
            senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
            content: {
                subject: `Leave Request Approved - ${leaveType}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background-color: #28a745;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 4px 4px 0 0;
                            }
                            .content {
                                background-color: #f8f9fa;
                                padding: 20px;
                                border-radius: 0 0 4px 4px;
                            }
                            .details {
                                background-color: white;
                                padding: 15px;
                                border-radius: 4px;
                                margin: 15px 0;
                            }
                            .detail-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #e9ecef;
                            }
                            .detail-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: bold;
                                color: #495057;
                            }
                            .value {
                                color: #212529;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #666;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>✓ Leave Request Approved</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>Your leave request has been approved!</p>
                                <div class="details">
                                    <div class="detail-row">
                                        <span class="label">Leave Type:</span>
                                        <span class="value">${leaveType}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Start Date:</span>
                                        <span class="value">${new Date(startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">End Date:</span>
                                        <span class="value">${new Date(endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Days Requested:</span>
                                        <span class="value">${daysRequested}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Approved By:</span>
                                        <span class="value">${approverName}</span>
                                    </div>
                                    ${approverComments ? `
                                    <div class="detail-row">
                                        <span class="label">Comments:</span>
                                        <span class="value">${approverComments}</span>
                                    </div>
                                    ` : ''}
                                </div>
                                <p>Please ensure all necessary handovers are completed before your leave commences.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated email, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            },
            recipients: {
                to: [{ address: email }],
            },
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            this.logger.log(`Leave approved email sent to ${email}`);
        } catch (error) {
            this.logger.error('Error sending leave approved email:', error);
            throw new Error('Failed to send leave approved email');
        }
    }

    async sendLeaveRejectedEmail(
        email: string,
        userName: string,
        leaveType: string,
        startDate: Date,
        endDate: Date,
        daysRequested: number,
        approverName: string,
        approverComments: string,
    ): Promise<void> {
        // DEVELOPMENT MODE: Log to console instead of sending email
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 LEAVE REJECTED EMAIL (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`To: ${email}`);
            this.logger.log(`User: ${userName}`);
            this.logger.log(`Leave Type: ${leaveType}`);
            this.logger.log(`Period: ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`);
            this.logger.log(`Days: ${daysRequested}`);
            this.logger.log(`Rejected By: ${approverName}`);
            this.logger.log(`Comments: ${approverComments || 'None'}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send via Azure Communication Services
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        const emailMessage: EmailMessage = {
            senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
            content: {
                subject: `Leave Request Rejected - ${leaveType}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background-color: #dc3545;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 4px 4px 0 0;
                            }
                            .content {
                                background-color: #f8f9fa;
                                padding: 20px;
                                border-radius: 0 0 4px 4px;
                            }
                            .details {
                                background-color: white;
                                padding: 15px;
                                border-radius: 4px;
                                margin: 15px 0;
                            }
                            .detail-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #e9ecef;
                            }
                            .detail-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: bold;
                                color: #495057;
                            }
                            .value {
                                color: #212529;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #666;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>✗ Leave Request Rejected</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>We regret to inform you that your leave request has been rejected.</p>
                                <div class="details">
                                    <div class="detail-row">
                                        <span class="label">Leave Type:</span>
                                        <span class="value">${leaveType}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Start Date:</span>
                                        <span class="value">${new Date(startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">End Date:</span>
                                        <span class="value">${new Date(endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Days Requested:</span>
                                        <span class="value">${daysRequested}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Rejected By:</span>
                                        <span class="value">${approverName}</span>
                                    </div>
                                    ${approverComments ? `
                                    <div class="detail-row">
                                        <span class="label">Reason:</span>
                                        <span class="value">${approverComments}</span>
                                    </div>
                                    ` : ''}
                                </div>
                                <p>If you have any questions or would like to discuss this further, please contact your manager or HR department.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated email, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            },
            recipients: {
                to: [{ address: email }],
            },
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            this.logger.log(`Leave rejected email sent to ${email}`);
        } catch (error) {
            this.logger.error('Error sending leave rejected email:', error);
            throw new Error('Failed to send leave rejected email');
        }
    }

    async sendTimesheetApprovedEmail(
        email: string,
        userName: string,
        weekStartDate: Date,
        weekEndDate: Date,
        approverName: string,
        approverComments: string,
    ): Promise<void> {
        // DEVELOPMENT MODE: Log to console instead of sending email
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 TIMESHEET APPROVED EMAIL (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`To: ${email}`);
            this.logger.log(`User: ${userName}`);
            this.logger.log(`Period: ${new Date(weekStartDate).toDateString()} to ${new Date(weekEndDate).toDateString()}`);
            this.logger.log(`Approved By: ${approverName}`);
            this.logger.log(`Comments: ${approverComments || 'None'}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send via Azure Communication Services
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        const emailMessage: EmailMessage = {
            senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
            content: {
                subject: 'Timesheet Approved',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background-color: #28a745;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 4px 4px 0 0;
                            }
                            .content {
                                background-color: #f8f9fa;
                                padding: 20px;
                                border-radius: 0 0 4px 4px;
                            }
                            .details {
                                background-color: white;
                                padding: 15px;
                                border-radius: 4px;
                                margin: 15px 0;
                            }
                            .detail-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #e9ecef;
                            }
                            .detail-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: bold;
                                color: #495057;
                            }
                            .value {
                                color: #212529;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #666;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>✓ Timesheet Approved</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>Your timesheet has been approved!</p>
                                <div class="details">
                                    <div class="detail-row">
                                        <span class="label">Week Start:</span>
                                        <span class="value">${new Date(weekStartDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Week End:</span>
                                        <span class="value">${new Date(weekEndDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Approved By:</span>
                                        <span class="value">${approverName}</span>
                                    </div>
                                    ${approverComments ? `
                                    <div class="detail-row">
                                        <span class="label">Comments:</span>
                                        <span class="value">${approverComments}</span>
                                    </div>
                                    ` : ''}
                                </div>
                                <p>Your timesheet has been processed and recorded.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated email, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            },
            recipients: {
                to: [{ address: email }],
            },
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            this.logger.log(`Timesheet approved email sent to ${email}`);
        } catch (error) {
            this.logger.error('Error sending timesheet approved email:', error);
            throw new Error('Failed to send timesheet approved email');
        }
    }

    async sendTimesheetRejectedEmail(
        email: string,
        userName: string,
        weekStartDate: Date,
        weekEndDate: Date,
        approverName: string,
        approverComments: string,
    ): Promise<void> {
        // DEVELOPMENT MODE: Log to console instead of sending email
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 TIMESHEET REJECTED EMAIL (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`To: ${email}`);
            this.logger.log(`User: ${userName}`);
            this.logger.log(`Period: ${new Date(weekStartDate).toDateString()} to ${new Date(weekEndDate).toDateString()}`);
            this.logger.log(`Rejected By: ${approverName}`);
            this.logger.log(`Comments: ${approverComments || 'None'}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send via Azure Communication Services
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        const emailMessage: EmailMessage = {
            senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
            content: {
                subject: 'Timesheet Rejected - Action Required',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background-color: #dc3545;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 4px 4px 0 0;
                            }
                            .content {
                                background-color: #f8f9fa;
                                padding: 20px;
                                border-radius: 0 0 4px 4px;
                            }
                            .details {
                                background-color: white;
                                padding: 15px;
                                border-radius: 4px;
                                margin: 15px 0;
                            }
                            .detail-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #e9ecef;
                            }
                            .detail-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: bold;
                                color: #495057;
                            }
                            .value {
                                color: #212529;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #666;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>✗ Timesheet Rejected</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>Your timesheet has been rejected and requires revision.</p>
                                <div class="details">
                                    <div class="detail-row">
                                        <span class="label">Week Start:</span>
                                        <span class="value">${new Date(weekStartDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Week End:</span>
                                        <span class="value">${new Date(weekEndDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Rejected By:</span>
                                        <span class="value">${approverName}</span>
                                    </div>
                                    ${approverComments ? `
                                    <div class="detail-row">
                                        <span class="label">Reason:</span>
                                        <span class="value">${approverComments}</span>
                                    </div>
                                    ` : ''}
                                </div>
                                <p>Please review the feedback, make necessary corrections, and resubmit your timesheet.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated email, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            },
            recipients: {
                to: [{ address: email }],
            },
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            this.logger.log(`Timesheet rejected email sent to ${email}`);
        } catch (error) {
            this.logger.error('Error sending timesheet rejected email:', error);
            throw new Error('Failed to send timesheet rejected email');
        }
    }

    async sendWfhApprovedEmail(
        email: string,
        userName: string,
        startDate: Date,
        endDate: Date,
        reason: string,
        approverName: string,
        approverComments: string,
    ): Promise<void> {
        // DEVELOPMENT MODE: Log to console instead of sending email
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 WFH APPROVED EMAIL (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`To: ${email}`);
            this.logger.log(`User: ${userName}`);
            this.logger.log(`Period: ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`);
            this.logger.log(`Reason: ${reason}`);
            this.logger.log(`Approved By: ${approverName}`);
            this.logger.log(`Comments: ${approverComments || 'None'}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send via Azure Communication Services
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        const emailMessage: EmailMessage = {
            senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
            content: {
                subject: 'Work From Home Request Approved',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background-color: #28a745;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 4px 4px 0 0;
                            }
                            .content {
                                background-color: #f8f9fa;
                                padding: 20px;
                                border-radius: 0 0 4px 4px;
                            }
                            .details {
                                background-color: white;
                                padding: 15px;
                                border-radius: 4px;
                                margin: 15px 0;
                            }
                            .detail-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #e9ecef;
                            }
                            .detail-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: bold;
                                color: #495057;
                            }
                            .value {
                                color: #212529;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #666;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>✓ Work From Home Request Approved</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>Your work from home request has been approved!</p>
                                <div class="details">
                                    <div class="detail-row">
                                        <span class="label">Start Date:</span>
                                        <span class="value">${new Date(startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">End Date:</span>
                                        <span class="value">${new Date(endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Reason:</span>
                                        <span class="value">${reason}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Approved By:</span>
                                        <span class="value">${approverName}</span>
                                    </div>
                                    ${approverComments ? `
                                    <div class="detail-row">
                                        <span class="label">Comments:</span>
                                        <span class="value">${approverComments}</span>
                                    </div>
                                    ` : ''}
                                </div>
                                <p>You may work from home during the approved period. Please ensure you remain available and productive during working hours.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated email, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            },
            recipients: {
                to: [{ address: email }],
            },
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            this.logger.log(`WFH approved email sent to ${email}`);
        } catch (error) {
            this.logger.error('Error sending WFH approved email:', error);
            throw new Error('Failed to send WFH approved email');
        }
    }

    async sendWfhRejectedEmail(
        email: string,
        userName: string,
        startDate: Date,
        endDate: Date,
        reason: string,
        approverName: string,
        approverComments: string,
    ): Promise<void> {
        // DEVELOPMENT MODE: Log to console instead of sending email
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 WFH REJECTED EMAIL (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`To: ${email}`);
            this.logger.log(`User: ${userName}`);
            this.logger.log(`Period: ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`);
            this.logger.log(`Reason: ${reason}`);
            this.logger.log(`Rejected By: ${approverName}`);
            this.logger.log(`Comments: ${approverComments || 'None'}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send via Azure Communication Services
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        const emailMessage: EmailMessage = {
            senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
            content: {
                subject: 'Work From Home Request Rejected',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .header {
                                background-color: #dc3545;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 4px 4px 0 0;
                            }
                            .content {
                                background-color: #f8f9fa;
                                padding: 20px;
                                border-radius: 0 0 4px 4px;
                            }
                            .details {
                                background-color: white;
                                padding: 15px;
                                border-radius: 4px;
                                margin: 15px 0;
                            }
                            .detail-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                border-bottom: 1px solid #e9ecef;
                            }
                            .detail-row:last-child {
                                border-bottom: none;
                            }
                            .label {
                                font-weight: bold;
                                color: #495057;
                            }
                            .value {
                                color: #212529;
                            }
                            .footer {
                                margin-top: 30px;
                                font-size: 12px;
                                color: #666;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>✗ Work From Home Request Rejected</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>We regret to inform you that your work from home request has been rejected.</p>
                                <div class="details">
                                    <div class="detail-row">
                                        <span class="label">Start Date:</span>
                                        <span class="value">${new Date(startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">End Date:</span>
                                        <span class="value">${new Date(endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Your Reason:</span>
                                        <span class="value">${reason}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">Rejected By:</span>
                                        <span class="value">${approverName}</span>
                                    </div>
                                    ${approverComments ? `
                                    <div class="detail-row">
                                        <span class="label">Reason for Rejection:</span>
                                        <span class="value">${approverComments}</span>
                                    </div>
                                    ` : ''}
                                </div>
                                <p>If you have any questions or would like to discuss this further, please contact your manager or HR department.</p>
                            </div>
                            <div class="footer">
                                <p>This is an automated email, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            },
            recipients: {
                to: [{ address: email }],
            },
        };

        try {
            const poller = await this.emailClient.beginSend(emailMessage);
            await poller.pollUntilDone();
            this.logger.log(`WFH rejected email sent to ${email}`);
        } catch (error) {
            this.logger.error('Error sending WFH rejected email:', error);
            throw new Error('Failed to send WFH rejected email');
        }
    }

    async sendLeaveSubmittedEmailToAdmins(
        submitterName: string,
        submitterEmail: string,
        leaveType: string,
        startDate: Date,
        endDate: Date,
        daysRequested: number,
        reason: string,
        geoLocation: string,
    ): Promise<void> {
        // Get all admins for the same geo_location
        const admins = await this.userRepository.find({
            where: {
                role: 'Admin',
                geo_location: geoLocation,
                is_active: true,
            }
        });

        if (admins.length === 0) {
            this.logger.warn(`No active admins found for geo_location: ${geoLocation}`);
            return;
        }

        // DEVELOPMENT MODE: Log to console
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 LEAVE SUBMITTED EMAIL TO ADMINS (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`From: ${submitterName} (${submitterEmail})`);
            this.logger.log(`Leave Type: ${leaveType}`);
            this.logger.log(`Period: ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`);
            this.logger.log(`Days: ${daysRequested}`);
            this.logger.log(`Reason: ${reason}`);
            this.logger.log(`Geo Location: ${geoLocation}`);
            this.logger.log(`To Admins (${admins.length}): ${admins.map(a => `${a.first_name} ${a.last_name} (${a.email})`).join(', ')}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send to all admins
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        for (const admin of admins) {
            const emailMessage: EmailMessage = {
                senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
                content: {
                    subject: `New Leave Request - ${submitterName}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    padding: 20px;
                                }
                                .header {
                                    background-color: #007bff;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                    border-radius: 4px 4px 0 0;
                                }
                                .content {
                                    background-color: #f8f9fa;
                                    padding: 20px;
                                    border-radius: 0 0 4px 4px;
                                }
                                .details {
                                    background-color: white;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .detail-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 8px 0;
                                    border-bottom: 1px solid #e9ecef;
                                }
                                .detail-row:last-child {
                                    border-bottom: none;
                                }
                                .label {
                                    font-weight: bold;
                                    color: #495057;
                                }
                                .value {
                                    color: #212529;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 12px;
                                    color: #666;
                                    text-align: center;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h2>📋 New Leave Request Submitted</h2>
                                </div>
                                <div class="content">
                                    <p>Dear ${admin.first_name},</p>
                                    <p>A new leave request has been submitted and requires your review.</p>
                                    <div class="details">
                                        <div class="detail-row">
                                            <span class="label">Employee:</span>
                                            <span class="value">${submitterName}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Email:</span>
                                            <span class="value">${submitterEmail}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Leave Type:</span>
                                            <span class="value">${leaveType}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Start Date:</span>
                                            <span class="value">${new Date(startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">End Date:</span>
                                            <span class="value">${new Date(endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Days Requested:</span>
                                            <span class="value">${daysRequested}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Reason:</span>
                                            <span class="value">${reason}</span>
                                        </div>
                                    </div>
                                    <p>Please review and take appropriate action on this request.</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated email, please do not reply.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                },
                recipients: {
                    to: [{ address: admin.email }],
                },
            };

            try {
                const poller = await this.emailClient.beginSend(emailMessage);
                await poller.pollUntilDone();
                this.logger.log(`Leave submitted email sent to admin: ${admin.email}`);
            } catch (error) {
                this.logger.error(`Error sending leave submitted email to admin ${admin.email}:`, error);
            }
        }
    }

    async sendTimesheetSubmittedEmailToAdmins(
        submitterName: string,
        submitterEmail: string,
        weekStartDate: Date,
        weekEndDate: Date,
        geoLocation: string,
    ): Promise<void> {
        // Get all admins for the same geo_location
        const admins = await this.userRepository.find({
            where: {
                role: 'Admin',
                geo_location: geoLocation,
                is_active: true,
            }
        });

        if (admins.length === 0) {
            this.logger.warn(`No active admins found for geo_location: ${geoLocation}`);
            return;
        }

        // DEVELOPMENT MODE: Log to console
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 TIMESHEET SUBMITTED EMAIL TO ADMINS (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`From: ${submitterName} (${submitterEmail})`);
            this.logger.log(`Period: ${new Date(weekStartDate).toDateString()} to ${new Date(weekEndDate).toDateString()}`);
            this.logger.log(`Geo Location: ${geoLocation}`);
            this.logger.log(`To Admins (${admins.length}): ${admins.map(a => `${a.first_name} ${a.last_name} (${a.email})`).join(', ')}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send to all admins
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        for (const admin of admins) {
            const emailMessage: EmailMessage = {
                senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
                content: {
                    subject: `New Timesheet Submitted - ${submitterName}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    padding: 20px;
                                }
                                .header {
                                    background-color: #007bff;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                    border-radius: 4px 4px 0 0;
                                }
                                .content {
                                    background-color: #f8f9fa;
                                    padding: 20px;
                                    border-radius: 0 0 4px 4px;
                                }
                                .details {
                                    background-color: white;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .detail-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 8px 0;
                                    border-bottom: 1px solid #e9ecef;
                                }
                                .detail-row:last-child {
                                    border-bottom: none;
                                }
                                .label {
                                    font-weight: bold;
                                    color: #495057;
                                }
                                .value {
                                    color: #212529;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 12px;
                                    color: #666;
                                    text-align: center;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h2>📋 New Timesheet Submitted</h2>
                                </div>
                                <div class="content">
                                    <p>Dear ${admin.first_name},</p>
                                    <p>A new timesheet has been submitted and requires your review.</p>
                                    <div class="details">
                                        <div class="detail-row">
                                            <span class="label">Employee:</span>
                                            <span class="value">${submitterName}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Email:</span>
                                            <span class="value">${submitterEmail}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Week Start:</span>
                                            <span class="value">${new Date(weekStartDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Week End:</span>
                                            <span class="value">${new Date(weekEndDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p>Please review and take appropriate action on this timesheet.</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated email, please do not reply.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                },
                recipients: {
                    to: [{ address: admin.email }],
                },
            };

            try {
                const poller = await this.emailClient.beginSend(emailMessage);
                await poller.pollUntilDone();
                this.logger.log(`Timesheet submitted email sent to admin: ${admin.email}`);
            } catch (error) {
                this.logger.error(`Error sending timesheet submitted email to admin ${admin.email}:`, error);
            }
        }
    }

    async sendWfhSubmittedEmailToAdmins(
        submitterName: string,
        submitterEmail: string,
        startDate: Date,
        endDate: Date,
        reason: string,
        geoLocation: string,
    ): Promise<void> {
        // Get all admins for the same geo_location
        const admins = await this.userRepository.find({
            where: {
                role: 'Admin',
                geo_location: geoLocation,
                is_active: true,
            }
        });

        if (admins.length === 0) {
            this.logger.warn(`No active admins found for geo_location: ${geoLocation}`);
            return;
        }

        // DEVELOPMENT MODE: Log to console
        if (this.isDevelopment) {
            this.logger.log('='.repeat(80));
            this.logger.log('📧 WFH SUBMITTED EMAIL TO ADMINS (Development Mode - Not Actually Sent)');
            this.logger.log('='.repeat(80));
            this.logger.log(`From: ${submitterName} (${submitterEmail})`);
            this.logger.log(`Period: ${new Date(startDate).toDateString()} to ${new Date(endDate).toDateString()}`);
            this.logger.log(`Reason: ${reason}`);
            this.logger.log(`Geo Location: ${geoLocation}`);
            this.logger.log(`To Admins (${admins.length}): ${admins.map(a => `${a.first_name} ${a.last_name} (${a.email})`).join(', ')}`);
            this.logger.log('='.repeat(80));
            return;
        }

        // PRODUCTION MODE: Send to all admins
        if (!this.emailClient) {
            throw new Error('Email client not initialized. Check AZURE_COMMUNICATION_CONNECTION_STRING.');
        }

        for (const admin of admins) {
            const emailMessage: EmailMessage = {
                senderAddress: process.env.AZURE_EMAIL_FROM || 'DoNotReply@your-domain.azurecomm.net',
                content: {
                    subject: `New Work From Home Request - ${submitterName}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    line-height: 1.6;
                                    color: #333;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    padding: 20px;
                                }
                                .header {
                                    background-color: #007bff;
                                    color: white;
                                    padding: 20px;
                                    text-align: center;
                                    border-radius: 4px 4px 0 0;
                                }
                                .content {
                                    background-color: #f8f9fa;
                                    padding: 20px;
                                    border-radius: 0 0 4px 4px;
                                }
                                .details {
                                    background-color: white;
                                    padding: 15px;
                                    border-radius: 4px;
                                    margin: 15px 0;
                                }
                                .detail-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 8px 0;
                                    border-bottom: 1px solid #e9ecef;
                                }
                                .detail-row:last-child {
                                    border-bottom: none;
                                }
                                .label {
                                    font-weight: bold;
                                    color: #495057;
                                }
                                .value {
                                    color: #212529;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 12px;
                                    color: #666;
                                    text-align: center;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h2>📋 New Work From Home Request Submitted</h2>
                                </div>
                                <div class="content">
                                    <p>Dear ${admin.first_name},</p>
                                    <p>A new work from home request has been submitted and requires your review.</p>
                                    <div class="details">
                                        <div class="detail-row">
                                            <span class="label">Employee:</span>
                                            <span class="value">${submitterName}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Email:</span>
                                            <span class="value">${submitterEmail}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Start Date:</span>
                                            <span class="value">${new Date(startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">End Date:</span>
                                            <span class="value">${new Date(endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="label">Reason:</span>
                                            <span class="value">${reason}</span>
                                        </div>
                                    </div>
                                    <p>Please review and take appropriate action on this request.</p>
                                </div>
                                <div class="footer">
                                    <p>This is an automated email, please do not reply.</p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                },
                recipients: {
                    to: [{ address: admin.email }],
                },
            };

            try {
                const poller = await this.emailClient.beginSend(emailMessage);
                await poller.pollUntilDone();
                this.logger.log(`WFH submitted email sent to admin: ${admin.email}`);
            } catch (error) {
                this.logger.error(`Error sending WFH submitted email to admin ${admin.email}:`, error);
            }
        }
    }
}
