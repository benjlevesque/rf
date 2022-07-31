import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { AuthService } from '../auth.service';

@Injectable()
export class LoginCommand {
  constructor(private readonly service: AuthService) {}
  @Command({ command: 'auth:login', describe: 'Login' })
  async run(): Promise<void> {
    const { createSpinner } = await import('nanospinner');
    const spinner = createSpinner();

    spinner.start({ text: 'Logging in...' });
    await this.service.login();
    spinner.success({ text: 'Success!' });
  }
}
