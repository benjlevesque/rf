import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { OutputService } from '~/output.service';

import { WhoamiService } from './whoami.service';

@Injectable()
export class WhoamiCommand {
  constructor(
    private readonly service: WhoamiService,
    private readonly output: OutputService,
  ) {}
  @Command({ command: 'auth:whoami', describe: 'Get logged user info' })
  async run(): Promise<void> {
    const whoami = await this.service.whoami();
    this.output.writeJson(whoami);
  }
}
