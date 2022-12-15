import { NestFactory, repl } from '@nestjs/core';
import axios from 'axios';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { AppModule } from './app.module';
import { AuthService } from './auth';
import { CommandExplorerService } from './command-explorer.service';
import { CompletionService } from './completion';
import { ConfigService } from './config/config.service';
import { SimplifiedAxiosError } from './lib/axiosError';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const commands = app.get(CommandExplorerService).explore();

  const y = yargs;

  const errorHandler = async (e: unknown) => {
    if (axios.isAxiosError(e)) {
      const { message, data } = SimplifiedAxiosError.from(e);
      console.error(message);
      console.error(data);
    } else if (e instanceof Error) {
      console.error(e.message);
    } else {
      console.error(e);
    }

    await app.close();
    process.exit(1);
  };

  commands.forEach((c) => y.command(c));
  const completionService = app.get(CompletionService);

  y.demandCommand(1)
    .option('profile', {
      describe: 'The profile, or config file, to use',
      alias: 'p',
      default: 'dev',
    })
    .option('dev', { type: 'boolean', describe: 'Alias for --profile dev' })
    .option('staging', {
      type: 'boolean',
      describe: 'Alias for --profile staging',
    })
    .option('prod', { type: 'boolean', describe: 'Alias for --profile prod' })
    .option('format', {
      choices: ['human', 'json'],
      describe: 'The format of the texts',
      default: 'human',
    })
    .option('json', { type: 'boolean', describe: 'Alias for --format json' })
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .strict()
    .completion('completion', completionService.getCompletion)
    .scriptName('rf')
    .middleware(async (args) => {
      if (['auth:login', 'init'].includes(String(args._[0]))) return;
      app.get(ConfigService).loadDefaultProfile();
      await app.get(AuthService).refresh().catch(errorHandler);
    })
    .command('repl', false, () => repl(AppModule));

  try {
    await y.parse(hideBin(process.argv));
    await app.close();
  } catch (e) {
    await errorHandler(e);
  }
}
bootstrap();
