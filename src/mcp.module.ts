import { Module } from '@nestjs/common';
import { McpModule, McpTransportType } from '@rekog/mcp-nest';
import { SpeechModule } from './mcp/speech/speech.module';
import { VideoModule } from './mcp/video/video.module';
import { ImageModule } from './mcp/image/image.module';
import { MusicModule } from './mcp/music/music.module';
import { FileModule } from './mcp/file/file.module';

const SERVER_NAME = 'minimax-mcp';
const SERVER_VERSION = '0.1.0';

@Module({
  imports: [
    McpModule.forRoot({
      name: SERVER_NAME,
      version: SERVER_VERSION,
      description:
        'MCP server exposing the MiniMax platform APIs (speech, video, image, music, file) as model-callable tools over stdio.',
      transport: McpTransportType.STDIO,
      logging: false,
    }),
    SpeechModule,
    VideoModule,
    ImageModule,
    MusicModule,
    FileModule,
  ],
})
export class McpAppModule {}

export { SERVER_NAME, SERVER_VERSION };
