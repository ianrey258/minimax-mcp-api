import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { getAppConfig } from '../../../config/app.config';
import { BaseResp } from '../../../common/types/base-resp';
import { MINIMAX_HEADERS } from './minimax.constants';

export interface MinimaxRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  /** Response array buffer (e.g. file content). Otherwise axios returns JSON. */
  responseType?: 'json' | 'arraybuffer' | 'stream';
  /** Request timeout in ms */
  timeoutMs?: number;
}

export interface MinimaxRawResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface MinimaxJsonResponse<T> extends MinimaxRawResponse<T> {
  data: T & { base_resp?: BaseResp };
}

@Injectable()
export class MinimaxClient {
  private readonly logger = new Logger(MinimaxClient.name);

  constructor(private readonly http: HttpService) {}

  async request<T = unknown>(
    options: MinimaxRequestOptions,
  ): Promise<MinimaxRawResponse<T>> {
    const cfg = getAppConfig();
    const url = `${cfg.minimax.baseUrl}${options.path}`;

    const config: AxiosRequestConfig = {
      method: options.method,
      url,
      headers: {
        [MINIMAX_HEADERS.AUTHORIZATION]: cfg.minimax.defaultHeaders.Authorization,
        ...(options.body !== undefined && !(options.body instanceof FormData)
          ? { [MINIMAX_HEADERS.CONTENT_TYPE]: 'application/json' }
          : {}),
        ...(options.headers ?? {}),
      },
      data: options.body,
      params: options.query,
      responseType: options.responseType ?? 'json',
      timeout: options.timeoutMs ?? 60_000,
      // axios: don't throw on non-2xx — we inspect base_resp.status_code ourselves
      validateStatus: () => true,
    };

    const observable = this.http.request(config);
    const res = await firstValueFrom(observable);
    const data = res.data as T;

    if (cfg.nodeEnv !== 'production') {
      this.logger.debug(
        `${options.method} ${url} -> ${res.status} ${res.statusText}`,
      );
    }

    return {
      data,
      status: res.status,
      statusText: res.statusText,
      headers: this.flattenHeaders(res.headers as Record<string, unknown>),
    };
  }

  private flattenHeaders(h: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(h)) {
      if (v == null) continue;
      out[k] = Array.isArray(v) ? v.join(', ') : String(v);
    }
    return out;
  }
}
