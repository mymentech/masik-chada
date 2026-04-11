import { ConfigService } from '@nestjs/config';

export function getRequiredString(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
}

export function getBoolean(config: ConfigService, key: string, fallback: boolean): boolean {
  const value = config.get<string>(key);
  if (!value || !value.trim()) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function getNumber(
  config: ConfigService,
  key: string,
  fallback: number,
  min?: number,
): number {
  const value = config.get<string>(key);
  if (!value || !value.trim()) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return fallback;
  }

  if (typeof min === 'number' && parsed < min) {
    return min;
  }

  return parsed;
}

export function getStringList(config: ConfigService, key: string): string[] {
  const value = config.get<string>(key);
  if (!value || !value.trim()) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
