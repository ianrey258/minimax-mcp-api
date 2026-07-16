# minimax-mcp-api

A Model Context Protocol (MCP) server written in NestJS that wraps the
[MiniMax platform APIs](https://platform.minimax.io/docs/api-reference/api-overview)
and exposes them as MCP tools over **stdio**.

## Prerequisites

- **Node.js ≥ 22** (per `engines.node` in `package.json`). Older versions lack
  the TypeScript target support used in `tsconfig.build.json`.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Run (stdio)

```bash
node dist/main.js
```

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MINIMAX_API_KEY` | Yes | — | Bearer token for the MiniMax API |
| `MINIMAX_API_URL` | No | `https://api.minimax.io` | Base URL for the MiniMax API |
| `LOG_LEVEL` | No | `log` | One of `debug \| log \| warn \| error` |
| `NODE_ENV` | No | `development` | One of `development \| production \| test` |

Copy `.env.example` to `.env` and fill in `MINIMAX_API_KEY` before running.

## MCP tools

| Domain | Tool | Endpoint |
| --- | --- | --- |
| Speech | `speech_t2a_http` | `POST /v1/t2a_v2` |
| Speech | `speech_t2a_async_create` | `POST /v1/t2a_async_v2` |
| Speech | `speech_t2a_async_query` | `GET /v1/query/t2a_async_query_v2` |
| Speech | `speech_voice_clone` | `POST /v1/voice_clone` |
| Video | `video_text_to_video` | `POST /v1/video_generation` |
| Video | `video_image_to_video` | `POST /v1/video_generation` |
| Video | `video_agent_create` | `POST /v1/video_generation` |
| Video | `video_agent_query` | `GET /v1/query/video_template_generation` |
| Image | `image_text_to_image` | `POST /v1/image_generation` |
| Image | `image_to_image` | `POST /v1/image_generation` |
| Music | `music_generate` | `POST /v1/music_generation` |
| File | `files_upload` | `POST /v1/files/upload` |
| File | `files_list` | `GET /v1/files/list` |
| File | `files_retrieve` | `GET /v1/files/retrieve` |
| File | `files_retrieve_content` | `GET /v1/files/retrieve_content` |
| File | `files_delete` | `DELETE /v1/files/delete` |

(16 tools total over 5 domains.)

## Configure Claude Desktop

Add to `~/.config/claude_desktop_config.json` (note: the path to `dist/main.js`
must be **absolute**):

```json
{
  "mcpServers": {
    "minimax": {
      "command": "node",
      "args": ["/abs/path/to/minimax-mcp-api/dist/main.js"],
      "env": {
        "MINIMAX_API_KEY": "sk-..."
      }
    }
  }
}
```

## Probe with MCP Inspector

```bash
npm run inspect
```

## Troubleshooting

- **401/403 from any tool** — `MINIMAX_API_KEY` is missing, malformed, or
  revoked. Verify with `echo $MINIMAX_API_KEY` and recopy the key from the
  MiniMax dashboard.
- **`npm run build` fails with TypeScript errors** — Node version mismatch.
  Check `node -v` returns `v22.x`; older Node lacks the target support
  configured in `tsconfig.build.json`.
- **Claude Desktop can't connect** — confirm `args[0]` is an **absolute** path
  to `dist/main.js` (not relative) and that the file exists (run
  `npm run build` first).
- **`MINIMAX_API_URL` change has no effect** — stdio MCP servers read
  environment variables at startup only. Restart Claude Desktop (or the
  stdio process) after editing `.env`.

## License

UNLICENSED — private project, not for redistribution.