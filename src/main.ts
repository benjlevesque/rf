import { NestFactory } from '@nestjs/core';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { AppModule } from './app.module';
import { AuthService } from './auth';
import { CommandExplorerService } from './command-explorer.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const commands = app.get(CommandExplorerService).explore();

  const y = yargs;

  commands.forEach((c) => y.command(c));
  y.demandCommand(1)
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .strict()
    .completion()
    .scriptName('rf')
    .middleware(async (args) => {
      if (args._[0] === 'auth:login') return;
      await app.get(AuthService).refresh();
    });

  try {
    await y.parse(hideBin(process.argv));
    // await app.close();
  } catch (e) {
    console.error(e);
    // await app.close();
    process.exit(1);
  }
}
bootstrap();
