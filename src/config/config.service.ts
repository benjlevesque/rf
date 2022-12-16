import { Injectable } from '@nestjs/common';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { getProfile } from './profile';

const devDefaults = {
  port: 3333,
  auth0ClientId: '2gI6kSuwcpjyOmNKqnW3N1YaLG8wPiWq',
  auth0Domain: 'request-dev.eu.auth0.com',
  auth0TokenScope: 'openid email profile offline_access',
  auth0Organization: '',
  apiUrl: 'http://localhost:4000',
  network: 'test',
  accessToken: '',
  refreshToken: '',
  buyerEmail: '',
  sellerEmail: '',
};

const stagingDefaults = {
  ...devDefaults,
  auth0ClientId: 'Ul9L4futW5G2YnpKFiTpo9LxpNuNRooE',
  auth0Domain: 'auth.request.finance',
  apiUrl: 'https://api.request.network',
};

const prodDefaults = {
  ...stagingDefaults,
  network: 'live',
};

type Config = typeof devDefaults;
export const defaultProfiles: Record<string, Config> = {
  dev: devDefaults,
  staging: stagingDefaults,
  prod: prodDefaults,
};

const PATH_TO_LAST_REQUEST_ID = path.join(os.tmpdir(), 'rf_lastRequestId');

@Injectable()
export class ConfigService {
  public static readonly configDir = path.join(os.homedir(), '.rf');
  public profile: string;
  private _values: Config;

  constructor() {
    this.load();
  }

  public get configPath() {
    return path.join(ConfigService.configDir, `${this.profile}.json`);
  }
  get values(): Config {
    return this._values;
  }

  public load() {
    this.profile = getProfile();
    this._values = this.read();
  }

  private read(): Config {
    if (!fs.existsSync(this.configPath)) {
      return defaultProfiles[this.profile];
    }
    try {
      const raw = fs.readFileSync(this.configPath).toString();
      const obj = JSON.parse(raw) as Config;
      return obj;
    } catch (e) {
      console.warn(`Invalid config file ${this.configPath}`, e.message);
      return defaultProfiles[this.profile];
    }
  }

  update(values: Partial<Config>) {
    const currentValues = this.read();

    this._values = {
      ...currentValues,
      ...values,
    };

    fs.writeFileSync(this.configPath, JSON.stringify(this._values, null, 2));
  }

  get lastId() {
    if (fs.existsSync(PATH_TO_LAST_REQUEST_ID))
      return fs.readFileSync(PATH_TO_LAST_REQUEST_ID).toString();
    return null;
  }

  set lastId(id: string) {
    fs.writeFileSync(PATH_TO_LAST_REQUEST_ID, id);
  }
}
