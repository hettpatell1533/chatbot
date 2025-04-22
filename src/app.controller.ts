import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly mailService: MailerService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sendmail')
  async sendTestEmail(@Body() body: any): Promise<any> {
    try {
      const result = await this.mailService.sendMail({
        to: 'hettptl@gmail.com',
        subject: "Testing purpose",
        html: `<h1>Welcome to Brainboard</h1>`});
      return { message: 'Email sent successfully', result };
    } catch (error) {
      return { message: 'Error sending email', error };
    }
  }
}
