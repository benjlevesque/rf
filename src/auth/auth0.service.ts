import axios, { AxiosInstance } from 'axios';

import { Auth0User } from './user.entity';

export class Auth0Service {
  private client: AxiosInstance;
  constructor(url: string, token: string) {
    this.client = axios.create({
      baseURL: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getProfile() {
    const { data } = await this.client.get<Auth0User>('/userinfo');
    return data;
  }
}
