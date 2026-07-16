export const MINIMAX_CLIENT = Symbol('MINIMAX_CLIENT');

export const MINIMAX_ENDPOINTS = {
  T2A_HTTP: '/v1/t2a_v2',
  T2A_ASYNC_CREATE: '/v1/t2a_async_v2',
  T2A_ASYNC_QUERY: '/v1/query/t2a_async_query_v2',
  VOICE_CLONE: '/v1/voice_clone',
  VIDEO_GENERATION: '/v1/video_generation',
  VIDEO_TEMPLATE_QUERY: '/v1/query/video_template_generation',
  IMAGE_GENERATION: '/v1/image_generation',
  MUSIC_GENERATION: '/v1/music_generation',
  FILES_UPLOAD: '/v1/files/upload',
  FILES_LIST: '/v1/files/list',
  FILES_RETRIEVE: '/v1/files/retrieve',
  FILES_RETRIEVE_CONTENT: '/v1/files/retrieve_content',
  FILES_DELETE: '/v1/files/delete',
} as const;

export type MinimaxEndpoint =
  (typeof MINIMAX_ENDPOINTS)[keyof typeof MINIMAX_ENDPOINTS];

export const MINIMAX_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
} as const;
