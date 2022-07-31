import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { copyTemplates } from '~/api/templates';
import { AuthService } from '~/auth';
import { WhoamiService } from '~/auth/whoami/whoami.service';

import { ConfigService } from './config.service';

export const getEmails = (email: string) => {
  const [, mail, plus, domain] = /([a-zA-Z0-9\-\.]*)(\+.*)?@(.*)/.exec(email);

  const sellerEmail =
    plus === '+seller' || !Number.isNaN(Number(plus))
      ? email
      : `${mail}+seller@${domain}`;

  const buyerEmail =
    plus === '+buyer'
      ? email
      : !Number.isNaN(Number(plus))
      ? `${mail}+${(Number(plus) % 2) + 1}@${domain}`
      : `${mail}+buyer@${domain}`;
  return { buyerEmail, sellerEmail };
};

@Injectable()
export class InitCommand {
  constructor(
    private readonly loginService: AuthService,
    private readonly configService: ConfigService,
    private readonly whoami: WhoamiService,
  ) {}

  @Command({ command: 'init', describe: 'Init RF cli' })
  async run(): Promise<void> {
    const { prompt } = await import('inquirer');
    const { createSpinner } = await import('nanospinner');
    const spinner = createSpinner();
    spinner.start({ text: 'Logging in...' });

    if (!this.configService.values.accessToken) {
      await this.loginService.login();
    }

    const { profile } = await this.whoami.whoami();
    spinner.success({ text: `Logged in! ✅  Welcome ${profile.email}` });

    const defaults = getEmails(profile.email);
    const values = await prompt([
      {
        name: 'sellerEmail',
        message: 'Seller email?',
        type: 'input',
        default: this.configService.values.sellerEmail || defaults.sellerEmail,
      },
      {
        name: 'buyerEmail',
        message: 'Buyer email?',
        type: 'input',
        default: this.configService.values.buyerEmail || defaults.buyerEmail,
      },
    ]);

    this.configService.update(values);

    spinner.success({ text: 'Settings updated ✅' });
    spinner.start({ text: 'Copy default templates' });

    copyTemplates();

    spinner.success({ text: 'All good 🎉' });
  }
}
