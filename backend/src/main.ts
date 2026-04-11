import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getStringList } from './common/config/runtime-config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const nodeEnv = (configService.get<string>('NODE_ENV') || '').toLowerCase();
  const isProduction = nodeEnv === 'production';
  const allowedOrigins = getStringList(configService, 'CORS_ALLOWED_ORIGINS');
  const allowAnyOriginForDevelopment = !isProduction && allowedOrigins.length === 0;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowAnyOriginForDevelopment || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin denied: ${origin}`));
    },
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  const port = Number(process.env.PORT || 5000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
