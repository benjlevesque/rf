import { Module } from '@nestjs/common';

import { ConfigModule } from '~/config/config.module';
import { OutputService } from '~/output.service';

import { AuthService } from './auth.service';
import { LoginCommand } from './login/login.command';
import { loginProcessorProvider } from './processor.provider';
import { TokenCommand } from './token/token.command';
import { TokenService } from './token/token.service';
import { WhoamiCommand } from './whoami/whoami.command';
import { WhoamiService } from './whoami/whoami.service';

@Module({
  imports: [ConfigModule],
  providers: [
    loginProcessorProvider,
    OutputService,
    AuthService,
    WhoamiService,
    TokenService,
    LoginCommand,
    WhoamiCommand,
    TokenCommand,
  ],
  exports: [AuthService],
})
export class AuthModule {}
