import {inject} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {EmailService} from '../services/email.service';

export class NotificationController {
  constructor(
    @inject('services.EmailService')
    private emailService: EmailService,
  ) {}

  @post('/send-email')
  async sendEmail(
    @requestBody() body: {to: string; subject: string; message: string},
  ) {
    await this.emailService.sendEmail(body.to, body.subject, body.message);
    return {success: true};
  }
}
