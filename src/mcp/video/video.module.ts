import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { MinimaxModule } from '../../infrastructure/external-api/minimax/minimax.module';
import { VideoTools } from './video.tools';

const SERVER_NAME = 'minimax-mcp';

@Module({
  imports: [
    McpModule.forFeature([VideoTools], SERVER_NAME),
    MinimaxModule,
  ],
  providers: [VideoTools],
})
export class VideoModule {}
