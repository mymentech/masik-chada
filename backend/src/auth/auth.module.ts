import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { getRequiredString } from '../common/config/runtime-config';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    EmailModule,
    TypeOrmModule.forFeature([PasswordResetToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn = (config.get<string>('JWT_EXPIRES_IN') || '7d') as StringValue;

        return {
          secret: getRequiredString(config, 'JWT_SECRET'),
          signOptions: {
            audience: config.get<string>('JWT_AUDIENCE') || undefined,
            expiresIn,
            issuer: config.get<string>('JWT_ISSUER') || undefined,
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
