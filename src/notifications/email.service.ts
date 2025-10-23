import { Injectable, Logger } from '@nestjs/common';
import { sendVerificationEmail } from '../utils/email';
import { generateVerificationToken } from '../utils/token';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      await sendVerificationEmail(email, token);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Don't throw - allow registration to proceed even if email fails
    }
  }

  generateVerificationToken(): string {
    return generateVerificationToken();
  }

  getTokenExpiration(hours: number = 24): Date {
    const expires = new Date();
    expires.setHours(expires.getHours() + hours);
    return expires;
  }
}
