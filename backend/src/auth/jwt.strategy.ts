import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getRequiredString } from '../common/config/runtime-config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      audience: configService.get<string>('JWT_AUDIENCE') || undefined,
      issuer: configService.get<string>('JWT_ISSUER') || undefined,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredString(configService, 'JWT_SECRET'),
    });
  }

  validate(payload: { sub: string; email: string; name?: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
