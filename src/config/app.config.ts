import { getEnv } from './env';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'log' | 'warn' | 'error';
  minimax: {
    apiKey: string;
    baseUrl: string;
    defaultHeaders: { Authorization: string };
  };
}

let cached: AppConfig | undefined;

export function getAppConfig(): AppConfig {
  if (cached) return cached;
  const env = getEnv();
  cached = {
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    minimax: {
      apiKey: env.MINIMAX_API_KEY,
      baseUrl: env.MINIMAX_API_URL.replace(/\/+$/, ''),
      defaultHeaders: {
        Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
      },
    },
  };
  return cached;
}
