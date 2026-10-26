import { DynamicModule, Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { SpeechModule } from './mcp/speech/speech.module';
import { VideoModule } from './mcp/video/video.module';
import { ImageModule } from './mcp/image/image.module';
import { MusicModule } from './mcp/music/music.module';
import { FileModule } from './mcp/file/file.module';
import { BearerAuthGuard } from './common/guards/bearer-auth.guard';
import type { McpTransport } from './config/env';

const SERVER_NAME = 'minimax-mcp';
const SERVER_VERSION = '0.1.0';

@Module({})
export class McpAppModule {
  static forRoot(transport: McpTransport): DynamicModule {
    return {
      module: McpAppModule,
      imports: [
        McpModule.forRoot({
          name: SERVER_NAME,
          version: SERVER_VERSION,
          description:
            'MCP server exposing the MiniMax platform APIs (speech, video, image, music, file) as model-callable tools over stdio or streamable HTTP.',
          ...(transport === 'http'
            ? { transport: McpTransportType.STREAMABLE_HTTP, guards: [BearerAuthGuard] }
            : { transport: McpTransportType.STDIO }),
          logging: false,
        }),
        SpeechModule,
        VideoModule,
        ImageModule,
        MusicModule,
        FileModule,
      ],
    };
  }
}

export { SERVER_NAME, SERVER_VERSION };
