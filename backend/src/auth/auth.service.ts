import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { getNumber } from '../common/config/runtime-config';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';

interface LoginAttemptWindow {
  attempts: number;
  blockedUntil: number;
  windowStartedAt: number;
}

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly loginAttemptStore = new Map<string, LoginAttemptWindow>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly lockMs: number;
  private readonly failedLoginDelayMs: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
  ) {
    this.maxAttempts = getNumber(this.config, 'AUTH_LOGIN_MAX_ATTEMPTS', 10, 1);
    this.windowMs = getNumber(this.config, 'AUTH_LOGIN_WINDOW_MS', 15 * 60 * 1000, 1000);
    this.lockMs = getNumber(this.config, 'AUTH_LOGIN_LOCK_MS', 15 * 60 * 1000, 1000);
    this.failedLoginDelayMs = getNumber(this.config, 'AUTH_LOGIN_FAILED_DELAY_MS', 250, 0);
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
      role: user.role,
    });

    return { token, user };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const normalized = email.toLowerCase().trim();
    if (!normalized) return;

    const user = await this.usersService.findByEmail(normalized);
    // Silently succeed even when user is missing so the endpoint does not leak
    // which emails are registered.
    if (!user) {
      this.logger.log(`Password reset requested for unknown email=${normalized}`);
      return;
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.tokenRepo.save(
      this.tokenRepo.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }),
    );

    const base =
      this.config.get<string>('PASSWORD_RESET_URL_BASE') || 'http://localhost:5173/reset-password';
    const resetUrl = `${base}?token=${rawToken}`;

    await this.emailService.send({
      to: user.email,
      subject: 'মাসিক চাঁদা — পাসওয়ার্ড রিসেট',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
          <h2 style="color:#166534;margin:0 0 12px;">পাসওয়ার্ড রিসেট</h2>
          <p>আসসালামু আলাইকুম ${user.name},</p>
          <p>আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে নিচের বাটনে ক্লিক করুন। এই লিংকটি ১ ঘণ্টা পর্যন্ত সক্রিয় থাকবে।</p>
          <p style="margin:24px 0;">
            <a href="${resetUrl}" style="background:#16a34a;color:#ffffff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;">পাসওয়ার্ড রিসেট করুন</a>
          </p>
          <p style="color:#6b7280;font-size:13px;">যদি আপনি এই অনুরোধটি না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন।</p>
          <p style="color:#9ca3af;font-size:12px;word-break:break-all;">${resetUrl}</p>
        </div>
      `,
    });
  }

  async resetPasswordWithToken(rawToken: string, newPassword: string): Promise<void> {
    if (!rawToken || !newPassword) {
      throw new UnauthorizedException('Invalid reset request');
    }
    if (newPassword.length < 6) {
      throw new HttpException('Password must be at least 6 characters', HttpStatus.BAD_REQUEST);
    }

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const record = await this.tokenRepo.findOne({ where: { token_hash: tokenHash } });
    if (!record) throw new UnauthorizedException('Invalid or expired token');
    if (record.used_at) throw new UnauthorizedException('Token already used');
    if (new Date(record.expires_at).getTime() < Date.now()) {
      throw new UnauthorizedException('Token expired');
    }

    await this.usersService.setPasswordDirectly(Number(record.user_id), newPassword);
    await this.tokenRepo.update(record.id, { used_at: new Date() });
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
