import { BaseResp } from '../../../common/types/base-resp';

export interface ToolOk<T> {
  ok: true;
  data: T;
}

export interface ToolErr {
  ok: false;
  status_code: number;
  status_msg: string;
  http_status: number;
  upstream?: unknown;
}

export type ToolResult<T> = ToolOk<T> | ToolErr;

/**
 * Convert a Minimax response into a Tool-friendly structured object that
 * surfaces either the parsed data fields or an error envelope.
 */
export function formatToolResult<T extends { base_resp: BaseResp }>(
  body: T,
  httpStatus: number,
  pickData?: (t: T) => Record<string, unknown>,
): ToolResult<Record<string, unknown>> {
  const resp = body.base_resp;
  if (resp.status_code === 0) {
    const picked = pickData ? pickData(body) : (body as unknown as Record<string, unknown>);
    return { ok: true, data: picked };
  }
  return {
    ok: false,
    status_code: resp.status_code,
    status_msg: resp.status_msg,
    http_status: httpStatus,
    upstream: body,
  };
}
