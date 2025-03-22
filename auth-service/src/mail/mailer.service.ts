import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(@InjectQueue('emailQueue') private readonly mailQueue: Queue) {}

  async sendUserConfirmation(name: string, email: string, token: string) {
    await this.mailQueue.add('send-email', {
      type: 'verify-account',
      name,
      email,
      token,
    });
  }

  async sendResetPassword(email: string, token: string) {
    await this.mailQueue.add('send-email', {
      type: 'reset-password',
      email,
      token,
    });
  }
}
