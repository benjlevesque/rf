import { Module } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';

import { ApiModule } from './api/api.module';
import { AuthModule } from './auth';
import { WhoamiService } from './auth/whoami/whoami.service';
import { CommandExplorerService } from './command-explorer.service';
import { ConfigModule } from './config/config.module';
import { InitCommand } from './config/init.command';
import { OutputService } from './output.service';

@Module({
  imports: [ConfigModule, AuthModule, ApiModule],
  providers: [
    MetadataScanner,
    CommandExplorerService,
    WhoamiService,
    OutputService,
    InitCommand,
  ],
  exports: [],
})
export class AppModule {}
