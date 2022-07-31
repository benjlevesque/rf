import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { TokenService } from './token.service';

@Injectable()
export class TokenCommand {
  constructor(private readonly service: TokenService) {}

  @Command({ command: 'auth:token', describe: 'Get token' })
  async run(): Promise<void> {
    await this.service.getToken();
  }
}
