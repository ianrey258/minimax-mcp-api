import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { MinimaxModule } from '../../infrastructure/external-api/minimax/minimax.module';
import { FileTools } from './file.tools';

const SERVER_NAME = 'minimax-mcp';

@Module({
  imports: [
    McpModule.forFeature([FileTools], SERVER_NAME),
    MinimaxModule,
  ],
  providers: [FileTools],
})
export class FileModule {}
