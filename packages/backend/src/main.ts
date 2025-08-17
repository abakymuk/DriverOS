import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupOpenTelemetry } from './config/telemetry';

async function bootstrap() {
  // Setup OpenTelemetry before creating the app
  await setupOpenTelemetry();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('DriverOS API')
    .setDescription('DriverOS Container Logistics Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('terminals', 'Terminal management')
    .addTag('vessels', 'Vessel management')
    .addTag('containers', 'Container management')
    .addTag('slots', 'Slot booking')
    .addTag('drivers', 'Driver management')
    .addTag('trips', 'Trip management')
    .addTag('auth', 'Authentication')
    .addTag('metrics', 'System metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Sentry setup
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: configService.get<string>('NODE_ENV', 'development'),
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: app.getHttpAdapter().getInstance() }),
        new Sentry.Integrations.Prisma(),
      ],
      tracesSampleRate: configService.get<string>('NODE_ENV') === 'production' ? 0.1 : 1.0,
      profilesSampleRate: configService.get<string>('NODE_ENV') === 'production' ? 0.1 : 1.0,
    });
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 DriverOS Backend is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/api/v1/health`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});