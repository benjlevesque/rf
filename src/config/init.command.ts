import { Injectable } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { Command } from 'nestjs-command';

import { copyTemplates } from '~/api/templates';
import { AuthModule, AuthService } from '~/auth';
import { WhoamiService } from '~/auth/whoami/whoami.service';

import { ConfigService, defaultProfiles } from './config.service';
import { isFallbackProfile, setProfile } from './profile';

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
    private readonly configService: ConfigService,
    private readonly lazy: LazyModuleLoader,
  ) {}

  @Command({ command: 'init', describe: 'Init RF cli' })
  async run(): Promise<void> {
    const { prompt } = await import('inquirer');

    if (isFallbackProfile()) {
      const { profileName } = await prompt([
        {
          name: 'profileName',
          message: 'Choose profile',
          type: 'list',
          choices: Object.keys(defaultProfiles),
        },
      ]);

      setProfile(profileName);
      this.configService.load();
      this.configService.update(defaultProfiles[profileName]);
    }

    const { createSpinner } = await import('nanospinner');
    const spinner = createSpinner();

    // Module needs to be lazy loaded so the config matches the above selection
    const authModule = await this.lazy.load(() => AuthModule);
    if (!this.configService.values.accessToken) {
      const auth = await authModule.resolve(AuthService);
      spinner.start({ text: 'Logging in...' });

      await auth.login();
      spinner.success({ text: 'Logged in! ✅' });
    }

    const whoami = await authModule.resolve(WhoamiService);

    const { profile } = await whoami.whoami();
    console.log(`Welcome ${profile.email}`);

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
