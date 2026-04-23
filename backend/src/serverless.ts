/**
 * Serverless entry point for Vercel deployment.
 * Wraps the NestJS app in an Express adapter and exports a request handler.
 * The main.ts entry is used for Docker/VPS deployments; this file is used on Vercel.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getStringList } from './common/config/runtime-config';

const expressServer = express();

// Lazily initialise once per serverless container lifetime
let appReady: Promise<void> | undefined;

function bootstrap(): Promise<void> {
  if (appReady) return appReady;

  appReady = (async () => {
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressServer), {
      logger: ['error', 'warn', 'log'],
    });

    const configService = nestApp.get(ConfigService);
    const isProduction =
      (configService.get<string>('NODE_ENV') || '').toLowerCase() === 'production';
    const allowedOrigins = getStringList(configService, 'CORS_ALLOWED_ORIGINS');

    nestApp.enableCors({
      origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (!isProduction || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS origin denied: ${origin}`));
      },
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: false,
      methods: ['GET', 'POST', 'OPTIONS'],
    });

    await nestApp.init();
  })();

  return appReady;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await bootstrap();
  expressServer(req as express.Request, res as express.Response);
}
