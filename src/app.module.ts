import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpAppModule } from './mcp.module';
import type { McpTransport } from './config/env';

@Module({})
export class AppModule {
  static forRoot(transport: McpTransport): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        McpAppModule.forRoot(transport),
      ],
    };
  }
}
