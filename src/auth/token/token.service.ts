import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class TokenService {
  constructor(private readonly auth: AuthService) {}

  async getToken() {
    const token = this.auth.get();
    console.log(token.accessToken);
  }
}
