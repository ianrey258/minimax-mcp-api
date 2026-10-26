import { z } from 'zod';

const envSchema = z
  .object({
    MINIMAX_API_KEY: z.string().min(1, 'MINIMAX_API_KEY is required'),
    MINIMAX_API_URL: z
      .string()
      .url()
      .default('https://api.minimax.io'),
    LOG_LEVEL: z
      .enum(['debug', 'log', 'warn', 'error'])
      .default('log'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    MCP_TRANSPORT: z.enum(['stdio', 'http']).default('stdio'),
    PORT: z.coerce.number().int().positive().default(3000),
    MCP_AUTH_TOKEN: z.string().min(1).optional(),
  })
  .refine((env) => env.MCP_TRANSPORT !== 'http' || !!env.MCP_AUTH_TOKEN, {
    message: 'MCP_AUTH_TOKEN is required when MCP_TRANSPORT=http',
    path: ['MCP_AUTH_TOKEN'],
  });

export type Env = z.infer<typeof envSchema>;
export type McpTransport = Env['MCP_TRANSPORT'];

let cached: Env | undefined;

export function validateEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`,
    );
    console.error('Invalid environment configuration:');
    console.error(lines.join('\n'));
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}

export function getEnv(): Env {
  if (!cached) return validateEnv();
  return cached;
}
