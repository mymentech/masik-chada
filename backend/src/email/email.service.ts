import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(input: SendEmailInput): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';

    if (!apiKey || apiKey.startsWith('placeholder')) {
      // Dev/placeholder mode: log the email so the reset flow remains testable
      // without real credentials.
      this.logger.warn(
        `[EmailService] RESEND_API_KEY not configured — logging email instead of sending.\n` +
          `  to: ${input.to}\n  subject: ${input.subject}\n  html: ${input.html}`,
      );
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Resend API error ${response.status}: ${body}`);
      throw new Error(`Failed to send email: ${response.status}`);
    }
  }
}
