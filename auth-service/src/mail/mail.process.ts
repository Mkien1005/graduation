import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Processor('emailQueue')
export class MailProcessor extends WorkerHost {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { type, name, email, token, vpsName, expiredAt } = job.data;
    const domainUrl: string = this.configService.get('FRONTEND_URL');

    let subject: string;
    let template: string;
    let context: Object;

    switch (type) {
      case 'verify-account':
        subject = 'Verify Your Email';
        template = 'verify-account';
        context = {
          name,
          verifyUrl: `${domainUrl}/auth/verify?token=${token}`,
        };
        break;

      case 'reset-password':
        subject = 'Reset Your Password';
        template = 'reset-password';
        context = {
          resetUrl: `${domainUrl}/reset-password?token=${token}`,
        };
        break;

      case 'reminder-expiration':
        subject = 'Your VPS Server is about to expire';
        template = 'reminder-expiration';
        context = {
          name,
          vpsName,
          expirationDate: new Date(expiredAt).toLocaleString(),
          renewalUrl: domainUrl,
        };
        break;

      case 'expired-vps':
        subject = 'Your VPS Server has expired';
        template = 'expired-vps';
        context = {
          name,
          vpsName,
          expirationDate: new Date(expiredAt).toLocaleString(),
          supportUrl: domainUrl,
        };
        break;

      default:
        console.error('Unknown email type:', type);
        return;
    }
    try {
      await this.mailerService.sendMail({
        to: email,
        subject,
        template,
        context,
      });
    } catch (error) {
      console.error('Failed to send email:', error.message);
      error.response?.body?.errors?.forEach((err) =>
        console.error(`Error Detail: ${err.message} (Field: ${err.field})`),
      );
      throw error;
    }
  }
}
