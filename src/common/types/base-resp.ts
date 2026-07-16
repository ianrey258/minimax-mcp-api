export interface BaseResp {
  status_code: number;
  status_msg: string;
}

export interface WithBaseResp<T> {
  base_resp: BaseResp;
  trace_id?: string;
  [key: string]: unknown;
}

export function isSuccess(baseResp: BaseResp | undefined): boolean {
  return !!baseResp && baseResp.status_code === 0;
}

export const BASE_RESP_ERROR_CODES = {
  UNKNOWN: 1000,
  TIMEOUT: 1001,
  RATE_LIMIT: 1002,
  AUTH_FAILED: 1004,
  LOW_BALANCE: 1008,
  TPM_RATE_LIMIT: 1039,
  SENSITIVE_INPUT: 1026,
  SENSITIVE_OUTPUT: 1027,
  INVALID_INPUT: 1042,
  INVALID_PARAMS: 2013,
  NO_CLONE_PERMISSION: 2038,
  FILE_TOO_LARGE: 2049,
} as const;
