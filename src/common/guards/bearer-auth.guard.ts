import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { getEnv } from '../../config/env';

/**
 * Protects the HTTP MCP endpoint: requires
 * `Authorization: Bearer <MCP_AUTH_TOKEN>` on every request.
 */
@Injectable()
export class BearerAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = getEnv().MCP_AUTH_TOKEN;
    const header = context.switchToHttp().getRequest<IncomingMessage>().headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

    if (!expected || !safeEqual(token, expected)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
