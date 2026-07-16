import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { MinimaxModule } from '../../infrastructure/external-api/minimax/minimax.module';
import { ImageTools } from './image.tools';

const SERVER_NAME = 'minimax-mcp';

@Module({
  imports: [
    McpModule.forFeature([ImageTools], SERVER_NAME),
    MinimaxModule,
  ],
  providers: [ImageTools],
})
export class ImageModule {}
