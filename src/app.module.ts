import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpAppModule } from './mcp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    McpAppModule,
  ],
})
export class AppModule {}
