import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Env, validateEnv } from './config/env';
import { StderrLogger } from './common/logger/stderr-logger';

// Tool inputs can carry base64 media (images, audio); Express' 100kb default is too small.
const HTTP_BODY_LIMIT = '50mb';

async function bootstrap(): Promise<void> {
  const env = validateEnv();

  const logger = new StderrLogger();
  Logger.overrideLogger(logger);

  if (env.MCP_TRANSPORT === 'http') {
    await bootstrapHttp(env, logger);
  } else {
    await bootstrapStdio(logger);
  }
}

async function bootstrapStdio(logger: StderrLogger): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule.forRoot('stdio'), {
    logger: ['error', 'warn'],
  });

  app.enableShutdownHooks();
  app.useLogger(logger);

  new Logger('Bootstrap').log(
    `minimax-mcp stdio server ready (pid=${process.pid}). Awaiting JSON-RPC on stdin.`,
  );

  // Keep the process alive; the stdio MCP server starts on application bootstrap.
  process.stdin.resume();
}

async function bootstrapHttp(env: Env, logger: StderrLogger): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot('http'), {
    logger: ['error', 'warn'],
  });

  app.enableShutdownHooks();
  app.useLogger(logger);
  app.useBodyParser('json', { limit: HTTP_BODY_LIMIT });

  await app.listen(env.PORT);

  new Logger('Bootstrap').log(
    `minimax-mcp HTTP server ready on port ${env.PORT}. Endpoint: POST /mcp`,
  );
}

bootstrap().catch((err) => {
  process.stderr.write(`Fatal during bootstrap: ${(err as Error).stack ?? err}\n`);
  process.exit(1);
});
