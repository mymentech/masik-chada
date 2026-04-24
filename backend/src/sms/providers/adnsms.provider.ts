import { Logger } from '@nestjs/common';
import { SmsProvider } from './sms-provider.interface';

export class AdnSmsProvider implements SmsProvider {
  private readonly logger = new Logger(AdnSmsProvider.name);

  // ADN SMS uses api_key:api_secret format — pass as "key:secret" in SMS_API_KEY
  constructor(
    private readonly apiKey: string,
    private readonly senderId: string,
  ) {}

  async send(to: string, message: string): Promise<void> {
    const [key, secret] = this.apiKey.split(':');

    const response = await fetch('https://portal.adnsms.com/api/v1/secure/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        api_secret: secret,
        request_type: 'SINGLE_SMS',
        sms_type: 'UNICODE',
        mobile: to,
        sms_content: message,
        sender_id: this.senderId,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`ADN SMS error ${response.status}: ${body}`);
      throw new Error(`ADN SMS send failed: ${response.status}`);
    }

    const result = await response.json().catch(() => null);
    if (result?.status === 'FAILED') {
      this.logger.error(`ADN SMS rejected: ${JSON.stringify(result)}`);
      throw new Error(`ADN SMS send rejected: ${result?.message ?? 'unknown error'}`);
    }
  }
}
