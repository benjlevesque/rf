import {
  AccessToken,
  Auth0LoginProcessor,
  ComboToken,
} from '@altostra/cli-login-auth0';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { ConfigService } from '~/config/config.service';

import { TokenExpiredError, TokenMissingError } from './errors';
import { Token } from './token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly processor: Auth0LoginProcessor<ComboToken>,
    private readonly config: ConfigService,
  ) {}

  async login() {
    const token = await this.processor.runLoginProcess();
    this.config.update({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
    });
  }

  get() {
    const { accessToken } = this.config.values;
    if (!accessToken) throw new TokenMissingError();

    const parsed = this.parseJwt<Token>(accessToken);
    if (this.isExpired(parsed)) {
      throw new TokenExpiredError();
    }

    return { accessToken, parsed };
  }

  public async refresh() {
    const { accessToken, refreshToken } = this.config.values;
    if (!refreshToken) return;
    const parsed = this.parseJwt<Token>(accessToken);

    if (!this.isExpired(parsed)) return;

    console.log('Refreshing token');

    const client = axios.create({ baseURL: parsed.iss });
    const { data } = await client.post<AccessToken>(
      '/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.processor.config.auth0ClientId,
        refresh_token: refreshToken,
      }),
    );
    this.config.update({ accessToken: data.access_token });
  }

  private parseJwt<T>(token: string) {
    return JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    ) as T;
  }

  private isExpired(accessToken: Token) {
    return Date.now() > accessToken.exp * 1000;
  }
}
