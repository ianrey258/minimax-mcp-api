import { Injectable, Logger } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { BaseResp } from '../../common/types/base-resp';
import { MinimaxClient } from '../../infrastructure/external-api/minimax/minimax.client';
import { MINIMAX_ENDPOINTS } from '../../infrastructure/external-api/minimax/minimax.constants';
import { formatToolResult, ToolResult } from '../../infrastructure/external-api/minimax/format-response';
import {
  FilesUploadInput,
  FilesUploadInputSchema,
  FilesListInput,
  FilesListInputSchema,
  FilesRetrieveInput,
  FilesRetrieveInputSchema,
  FilesRetrieveContentInput,
  FilesRetrieveContentInputSchema,
  FilesDeleteInput,
  FilesDeleteInputSchema,
} from './file.schemas';

interface FileObject {
  file_id?: number | string;
  bytes?: number;
  created_at?: number;
  filename?: string;
  purpose?: string;
}

interface FilesListResp {
  data?: FileObject[];
  has_more?: boolean;
  base_resp: BaseResp;
}

interface FileResp {
  file?: FileObject;
  base_resp: BaseResp;
}

interface FileDeleteResp {
  deleted?: boolean;
  file_id?: number | string;
  base_resp: BaseResp;
}

const CONTENT_TEXT_LIMIT = 256 * 1024;

@Injectable()
export class FileTools {
  private readonly logger = new Logger(FileTools.name);

  constructor(private readonly client: MinimaxClient) {}

  @Tool({
    name: 'files_upload',
    description:
      'Upload a file (document, audio, image, etc.) for downstream use. Use purpose=voice_clone before speech_voice_clone.',
    parameters: FilesUploadInputSchema,
  })
  async upload(
    input: FilesUploadInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    let fileBuf: Buffer;
    try {
      fileBuf = await fs.readFile(input.file_path);
    } catch (err) {
      return {
        ok: false,
        status_code: 2013,
        status_msg: `Could not read file_path: ${(err as Error).message}`,
        http_status: 0,
      };
    }
    const filename = input.filename ?? path.basename(input.file_path);

    const form = new FormData();
    form.append('purpose', input.purpose);
    form.append('file', new Blob([fileBuf]), filename);

    const res = await this.client.request<FileResp>({
      method: 'POST',
      path: MINIMAX_ENDPOINTS.FILES_UPLOAD,
      body: form,
      timeoutMs: 120_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      file: b.file,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'files_list',
    description: 'List uploaded files, optionally filtered by purpose.',
    parameters: FilesListInputSchema,
  })
  async list(
    input: FilesListInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const query: Record<string, string | number | undefined> = {
      purpose: input.purpose,
      limit: input.limit,
      after: input.after,
      order: input.order,
    };
    const res = await this.client.request<FilesListResp>({
      method: 'GET',
      path: MINIMAX_ENDPOINTS.FILES_LIST,
      query,
      timeoutMs: 30_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      files: b.data,
      has_more: b.has_more,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'files_retrieve',
    description: 'Get metadata for a single file by file_id.',
    parameters: FilesRetrieveInputSchema,
  })
  async retrieve(
    input: FilesRetrieveInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<FileResp>({
      method: 'GET',
      path: MINIMAX_ENDPOINTS.FILES_RETRIEVE,
      query: { file_id: input.file_id },
      timeoutMs: 30_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      file: b.file,
      base_resp: b.base_resp,
    }));
  }

  @Tool({
    name: 'files_retrieve_content',
    description:
      'Download a file. By default returns a summary (filename + bytes + content-type); pass as_hex=true to inline small file content as a hex string.',
    parameters: FilesRetrieveContentInputSchema,
  })
  async retrieveContent(
    input: FilesRetrieveContentInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<ArrayBuffer>({
      method: 'GET',
      path: MINIMAX_ENDPOINTS.FILES_RETRIEVE_CONTENT,
      query: { file_id: input.file_id },
      responseType: 'arraybuffer',
      timeoutMs: 120_000,
    });

    const buf = Buffer.from(res.data as ArrayBufferLike);
    const headerBuf = res.headers['content-disposition']
      ?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1];
    const filename = headerBuf ?? `file_${input.file_id}`;

    const tooLarge = buf.length > CONTENT_TEXT_LIMIT && !input.as_hex;
    if (tooLarge) {
      return formatToolResult(
        {
          base_resp: { status_code: 0, status_msg: 'success' },
        } as unknown as { base_resp: BaseResp },
        res.status,
        () => ({
          file_id: input.file_id,
          filename,
          content_type: res.headers['content-type'],
          bytes: buf.length,
          note:
            'File is larger than 256KB; re-call with as_hex=true (small files only) or use files_retrieve to fetch via HTTP client.',
        }),
      );
    }

    return formatToolResult(
      {
        base_resp: { status_code: 0, status_msg: 'success' },
      } as unknown as { base_resp: BaseResp },
      res.status,
      () => ({
        file_id: input.file_id,
        filename,
        content_type: res.headers['content-type'],
        bytes: buf.length,
        content_hex: input.as_hex ? buf.toString('hex') : undefined,
        content_base64: !input.as_hex ? buf.toString('base64') : undefined,
      }),
    );
  }

  @Tool({
    name: 'files_delete',
    description: 'Delete a file by file_id.',
    parameters: FilesDeleteInputSchema,
  })
  async delete(
    input: FilesDeleteInput,
  ): Promise<ToolResult<Record<string, unknown>>> {
    const res = await this.client.request<FileDeleteResp>({
      method: 'DELETE',
      path: MINIMAX_ENDPOINTS.FILES_DELETE,
      query: { file_id: input.file_id },
      timeoutMs: 30_000,
    });

    return formatToolResult(res.data, res.status, (b) => ({
      deleted: b.deleted,
      file_id: b.file_id,
      base_resp: b.base_resp,
    }));
  }
}
