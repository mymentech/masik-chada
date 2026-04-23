import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { getBoolean, getNumber } from './common/config/runtime-config';
import { createDepthLimitRule } from './common/graphql/depth-limit.rule';
import { normalizeGraphqlErrorCode } from './common/graphql/error-code-map';
import { createRequestLimitsPlugin } from './common/graphql/request-limits.plugin';
import { GqlAuthGuard } from './common/guards/gql-auth.guard';
import { UsersModule } from './users/users.module';
import { DonorsModule } from './donors/donors.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { JobsModule } from './jobs/jobs.module';
import { HealthModule } from './health/health.module';
import { AppResolver } from './app.resolver';
import { Donor } from './donors/entities/donor.entity';
import { Payment } from './payments/entities/payment.entity';
import { User } from './users/entities/user.entity';
import { MonthlyDonorSnapshot } from './jobs/entities/monthly-donor-snapshot.entity';
import { MonthlyJobRun } from './jobs/entities/monthly-job-run.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Donor, Payment, MonthlyDonorSnapshot, MonthlyJobRun],
        synchronize: false,
        ssl: config.get<string>('DATABASE_SSL') !== 'false'
          ? { rejectUnauthorized: false }
          : false,
        // Keep the pool small in serverless environments (one container = one request)
        extra: {
          max: process.env.VERCEL ? 1 : 10,
          connectionTimeoutMillis: 10_000,
          idleTimeoutMillis: 30_000,
        },
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = (config.get<string>('NODE_ENV') || '').toLowerCase() === 'production';
        const introspection = getBoolean(config, 'GRAPHQL_INTROSPECTION', !isProduction);
        const playground = getBoolean(config, 'GRAPHQL_PLAYGROUND', !isProduction);
        const maxDepth = getNumber(config, 'GRAPHQL_MAX_QUERY_DEPTH', 10, 1);
        const maxQueryLength = getNumber(config, 'GRAPHQL_MAX_QUERY_LENGTH', 10_000, 1);
        const maxVariablesBytes = getNumber(config, 'GRAPHQL_MAX_VARIABLES_BYTES', 20_000, 1);

        return {
          autoSchemaFile: true,
          context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
          driver: ApolloDriver,
          formatError: (formattedError) => ({
            ...formattedError,
            extensions: {
              ...formattedError.extensions,
              code: normalizeGraphqlErrorCode(
                typeof formattedError.extensions?.code === 'string'
                  ? formattedError.extensions.code
                  : undefined,
              ),
            },
          }),
          introspection,
          path: '/graphql',
          playground,
          plugins: [createRequestLimitsPlugin({ maxQueryLength, maxVariablesBytes })],
          sortSchema: true,
          validationRules: [createDepthLimitRule(maxDepth)],
        };
      },
    }),
    AuthModule,
    UsersModule,
    DonorsModule,
    PaymentsModule,
    DashboardModule,
    ReportsModule,
    JobsModule,
    HealthModule,
  ],
  providers: [
    AppResolver,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
})
export class AppModule {}
