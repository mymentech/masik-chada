import { Logger } from '@nestjs/common';
import { SmsProvider } from './sms-provider.interface';

export class OnecodesoftProvider implements SmsProvider {
  private readonly logger = new Logger(OnecodesoftProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly senderId: string,
  ) {}

  async send(to: string, message: string): Promise<void> {
    const response = await fetch('https://sms.onecodesoft.com/api/send-sms', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        senderid: this.senderId,
        number: to,
        message,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Onecodesoft SMS error ${response.status}: ${body}`);
      throw new Error(`Onecodesoft SMS send failed: ${response.status}`);
    }
  }
}
