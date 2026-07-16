import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { MinimaxModule } from '../../infrastructure/external-api/minimax/minimax.module';
import { MusicTools } from './music.tools';

const SERVER_NAME = 'minimax-mcp';

@Module({
  imports: [
    McpModule.forFeature([MusicTools], SERVER_NAME),
    MinimaxModule,
  ],
  providers: [MusicTools],
})
export class MusicModule {}
