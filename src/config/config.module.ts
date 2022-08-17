import { Module } from '@nestjs/common';
import yargs from 'yargs';

import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: 'PROFILE',
      useFactory: () => {
        return yargs
          .option('profile', {
            describe: 'The profile, or config file, to use',
            alias: 'p',
            default: 'dev',
          })
          .parseSync()['profile'];
      },
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
