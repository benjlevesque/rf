import { Module } from '@nestjs/common';
import { hideBin } from 'yargs/helpers';
import Parser from 'yargs-parser';

import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: 'PROFILE',
      useFactory: () => {
        const { profile, p } = Parser(hideBin(process.argv));
        return profile || p;
      },
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
