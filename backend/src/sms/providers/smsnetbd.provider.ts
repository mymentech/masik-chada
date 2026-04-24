import { Logger } from '@nestjs/common';
import { SmsProvider } from './sms-provider.interface';

export class SmsNetBdProvider implements SmsProvider {
  private readonly logger = new Logger(SmsNetBdProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly senderId: string,
  ) {}

  async send(to: string, message: string): Promise<void> {
    const response = await fetch('https://api.sms.net.bd/sendsms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        msg: message,
        to,
        sender_id: this.senderId,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`SMS.NET.BD error ${response.status}: ${body}`);
      throw new Error(`SMS.NET.BD send failed: ${response.status}`);
    }

    const result = await response.json().catch(() => null);
    if (result?.error !== 0) {
      this.logger.error(`SMS.NET.BD rejected: ${JSON.stringify(result)}`);
      throw new Error(`SMS.NET.BD send rejected: ${result?.msg ?? 'unknown error'}`);
    }
  }
}
