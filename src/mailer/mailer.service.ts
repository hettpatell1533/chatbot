import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ){}

    async sendVerificationEmail (email: string, token: string) {
      try {
        const subject = 'Verify your email address';
        const html = `
            <h1>Welcome to Brainboard</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;margin-top: 20px;">Verify Email</a>
        `;
        return await this.mailerService.sendMail({ to: email, from: 'noreply@gmail.com', subject, html });
      } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error(`Error sending verification email: ${error.message}`);
      }
    };

    async sendPasswordResetEmail (email: string, token: string) {
      try {
        const subject = 'Reset your password';
        const html = `
            <h1>Reset your password</h1>
            <p>Please click the link below to reset your password:</p>
            <a href="${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}">Reset Password</a>
        `;
        return this.mailerService.sendMail({ to: email,from: 'noreply@gmail.com', subject, html });
      } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error(`Error sending password reset email: ${error.message}`);
      }
    };
}
