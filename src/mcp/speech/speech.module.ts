import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { MinimaxModule } from '../../infrastructure/external-api/minimax/minimax.module';
import { SpeechTools } from './speech.tools';

const SERVER_NAME = 'minimax-mcp';

@Module({
  imports: [
    McpModule.forFeature([SpeechTools], SERVER_NAME),
    MinimaxModule,
  ],
  providers: [SpeechTools],
})
export class SpeechModule {}
