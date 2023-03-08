import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { AuthService } from '../auth.service';
import { WhoamiService } from '../whoami/whoami.service';

@Injectable()
export class LoginCommand {
  constructor(
    private readonly service: AuthService,
    private readonly whoami: WhoamiService,
  ) {}
  @Command({ command: 'auth:login', describe: 'Login' })
  async run(): Promise<void> {
    const { createSpinner } = await import('nanospinner');
    const spinner = createSpinner();

    spinner.start({ text: 'Logging in...' });
    await this.service.login();

    const { profile } = await this.whoami.whoami();

    spinner.success({ text: `Success! Welcome ${profile.email}` });
  }
}
