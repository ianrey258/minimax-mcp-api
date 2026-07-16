import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnv } from './config/env';
import { StderrLogger } from './common/logger/stderr-logger';

async function bootstrap(): Promise<void> {
  validateEnv();

  const logger = new StderrLogger();
  Logger.overrideLogger(logger);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  app.enableShutdownHooks();
  app.useLogger(logger);

  const appLogger = new Logger('Bootstrap');
  appLogger.log(
    `minimax-mcp stdio server ready (pid=${process.pid}). Awaiting JSON-RPC on stdin.`,
  );

  // Keep the process alive; the stdio MCP server starts on application bootstrap.
  process.stdin.resume();
}

bootstrap().catch((err) => {
  process.stderr.write(`Fatal during bootstrap: ${(err as Error).stack ?? err}\n`);
  process.exit(1);
});
