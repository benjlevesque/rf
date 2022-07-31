import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { Auth0Service } from '../auth0.service';

@Injectable()
export class WhoamiService {
  constructor(private readonly auth: AuthService) {}

  async whoami() {
    const token = this.auth.get();

    const auth0 = new Auth0Service(token.parsed.iss, token.accessToken);

    const profile = await auth0.getProfile();
    return { token: token.parsed, profile };
  }
}
