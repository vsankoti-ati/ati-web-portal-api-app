import { Injectable, Logger } from '@nestjs/common';
import { EmailClient, EmailMessage } from '@azure/communication-email';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private emailClient: EmailClient | null = null;
    private isDevelopment: boolean;

    constructor() {
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
}
