import { ConsoleLogger, LogLevel, LoggerService } from '@nestjs/common';

/**
 * Writes NestJS log output to stderr so the stdio JSON-RPC stream
 * (stdout) stays clean.
 */
export class StderrLogger extends ConsoleLogger implements LoggerService {
  protected override printMessages(
    messages: unknown[],
    context?: string,
    logLevel?: LogLevel,
    writeStreamType?: 'stdout' | 'stderr',
  ): void {
    // Always route through stderr — never stdout.
    super.printMessages(messages, context, logLevel, 'stderr');
  }
}
