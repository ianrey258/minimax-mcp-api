import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MinimaxClient } from './minimax.client';

@Module({
  imports: [HttpModule.register({})],
  providers: [MinimaxClient],
  exports: [MinimaxClient],
})
export class MinimaxModule {}
