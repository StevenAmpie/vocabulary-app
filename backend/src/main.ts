import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredCookieSecret = process.env.COOKIE_SECRET;

  if (isProduction && !configuredCookieSecret) {
    throw new Error('COOKIE_SECRET is required when NODE_ENV=production');
  }

  if (!configuredCookieSecret) {
    console.warn('⚠️ COOKIE_SECRET no está configurado; se usará una clave exclusiva para desarrollo local.');
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Registro de Plugins Fastify (Cookies & CORS)
  await app.register(fastifyCookie, {
    secret: configuredCookieSecret || 'local-development-only-cookie-secret',
  });

  await app.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Prefijo global de API
  app.setGlobalPrefix('api/v1');

  // Validación estricta de DTOs con Class Validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentación OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('Vocabulary App API')
    .setDescription('Backend API con soporte para Passkeys (WebAuthn), Spaced Repetition y Almanaque')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación Passwordless y Passkeys')
    .addTag('learning', 'Sesiones de estudio y repaso implícito')
    .addTag('almanac', 'Álbum y catálogo de palabras')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Vocabulary App Backend running on: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger API Documentation on: http://localhost:${port}/docs`);
}

bootstrap();
