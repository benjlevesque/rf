import { Inject, Injectable } from '@nestjs/common';
import fs from 'fs';
import os from 'os';
import path from 'path';

const defaults = {
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

type Config = typeof defaults;

const PATH_TO_LAST_REQUEST_ID = path.join(os.tmpdir(), 'rf_lastRequestId');

@Injectable()
export class ConfigService {
  public static readonly configDir = path.join(os.homedir(), '.rf');
  public readonly configPath: string;
  private _values: Config;

  constructor(
    @Inject('PROFILE')
    profile: string,
  ) {
    this.configPath = path.join(ConfigService.configDir, `${profile}.json`);
    this._values = this.read();
  }

  get values() {
    return this._values;
  }

  private read(): Config {
    if (!fs.existsSync(this.configPath)) {
      return defaults;
    }
    try {
      const raw = fs.readFileSync(this.configPath).toString();
      const obj = JSON.parse(raw) as Config;
      return obj;
    } catch (e) {
      console.warn(`Invalid config file ${this.configPath}`, e.message);
      return defaults;
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
