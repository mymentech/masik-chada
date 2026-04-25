import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './providers/sms-provider.interface';
import { SmsNetBdProvider } from './providers/smsnetbd.provider';
import { AdnSmsProvider } from './providers/adnsms.provider';
import { OnecodesoftProvider } from './providers/onecodesoft.provider';

// Returns '8801XXXXXXXXX' or null if not a valid BD mobile number
export function normalizeBdPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (/^8801[3-9]\d{8}$/.test(digits)) return digits;
  if (/^01[3-9]\d{8}$/.test(digits)) return '880' + digits;
  return null;
}

export function buildPaymentSmsMessage(_name: string, amount: number, paymentDate: string | Date): string {
  const date = new Date(paymentDate);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const formatted = `${dd}/${mm}/${yyyy}`;
  return `Your monthly subscription of BDT ${amount} received on ${formatted}. Thank you. - Moydane Mohammad`;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider: SmsProvider | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('SMS_API_KEY');

    if (!apiKey || apiKey.startsWith('placeholder')) {
      this.provider = null;
      return;
    }

    const providerName = config.get<string>('SMS_PROVIDER') ?? 'smsnetbd';
    const senderId = config.get<string>('SMS_SENDER_ID') ?? 'MasikChada';

    if (providerName === 'adnsms') {
      this.provider = new AdnSmsProvider(apiKey, senderId);
    } else if (providerName === 'onecodesoft') {
      this.provider = new OnecodesoftProvider(apiKey, senderId);
    } else {
      this.provider = new SmsNetBdProvider(apiKey, senderId);
    }
  }

  async send(to: string, message: string): Promise<void> {
    if (!this.provider) {
      this.logger.warn(
        `[SmsService] SMS_API_KEY not configured — logging SMS instead of sending.\n  to: ${to}\n  message: ${message}`,
      );
      return;
    }
    await this.provider.send(to, message);
  }
}
