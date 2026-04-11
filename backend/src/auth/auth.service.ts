import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { getNumber } from '../common/config/runtime-config';
import { UsersService } from '../users/users.service';

interface LoginAttemptWindow {
  attempts: number;
  blockedUntil: number;
  windowStartedAt: number;
}

@Injectable()
export class AuthService {
  private readonly loginAttemptStore = new Map<string, LoginAttemptWindow>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly lockMs: number;
  private readonly failedLoginDelayMs: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.maxAttempts = getNumber(configService, 'AUTH_LOGIN_MAX_ATTEMPTS', 10, 1);
    this.windowMs = getNumber(configService, 'AUTH_LOGIN_WINDOW_MS', 15 * 60 * 1000, 1000);
    this.lockMs = getNumber(configService, 'AUTH_LOGIN_LOCK_MS', 15 * 60 * 1000, 1000);
    this.failedLoginDelayMs = getNumber(configService, 'AUTH_LOGIN_FAILED_DELAY_MS', 250, 0);
  }

  async login(email: string, password: string, clientIp = 'unknown') {
    this.cleanupExpiredThrottleEntries();

    const throttleKey = this.getThrottleKey(email, clientIp);
    this.assertNotBlocked(throttleKey);

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      await this.registerFailedAttempt(throttleKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await this.registerFailedAttempt(throttleKey);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.loginAttemptStore.delete(throttleKey);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return { token, user };
  }

  private assertNotBlocked(key: string): void {
    const now = Date.now();
    const record = this.loginAttemptStore.get(key);

    if (!record) {
      return;
    }

    if (record.windowStartedAt + this.windowMs <= now) {
      this.loginAttemptStore.delete(key);
      return;
    }

    if (record.blockedUntil > now) {
      throw new HttpException('Too many login attempts. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private async registerFailedAttempt(key: string): Promise<void> {
    const now = Date.now();
    const current = this.loginAttemptStore.get(key);

    if (!current || current.windowStartedAt + this.windowMs <= now) {
      this.loginAttemptStore.set(key, {
        attempts: 1,
        blockedUntil: 0,
        windowStartedAt: now,
      });
      await this.delayFailedResponse();
      return;
    }

    const nextAttempts = current.attempts + 1;
    this.loginAttemptStore.set(key, {
      attempts: nextAttempts,
      blockedUntil: nextAttempts >= this.maxAttempts ? now + this.lockMs : current.blockedUntil,
      windowStartedAt: current.windowStartedAt,
    });

    await this.delayFailedResponse();
  }

  private getThrottleKey(email: string, clientIp: string): string {
    return `${email.toLowerCase().trim()}|${clientIp.trim().toLowerCase() || 'unknown'}`;
  }

  private async delayFailedResponse(): Promise<void> {
    if (this.failedLoginDelayMs <= 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), this.failedLoginDelayMs);
    });
  }

  private cleanupExpiredThrottleEntries(): void {
    const now = Date.now();

    for (const [key, record] of this.loginAttemptStore.entries()) {
      const windowExpired = record.windowStartedAt + this.windowMs <= now;
      const lockExpired = record.blockedUntil <= now;

      if (windowExpired && lockExpired) {
        this.loginAttemptStore.delete(key);
      }
    }
  }
}
