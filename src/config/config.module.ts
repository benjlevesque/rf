import { Module } from '@nestjs/common';
import { hideBin } from 'yargs/helpers';
import Parser from 'yargs-parser';

import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: 'PROFILE',
      useFactory: () => {
        const args = Parser(hideBin(process.argv));

        const profile = args.profile || args.p;
        if (profile && (args.dev || args.prod)) {
          console.error(
            'Cannot specify --dev or --prod together with a profile',
          );
          process.exit(1);
        }
        if (args.prod) return 'prod';
        if (args.dev || !profile) return 'dev';

        return profile;
      },
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
