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
  lastId: '',
  buyerEmail: '',
  sellerEmail: '',
};

type Config = typeof defaults;
export class ConfigService {
  public static readonly configDir = path.join(os.homedir(), '.rf');
  public static readonly configPath = path.join(this.configDir, 'config.json');
  private _values: Config;

  constructor() {
    this._values = this.read();
  }

  get values() {
    return this._values;
  }

  private read(): Config {
    if (!fs.existsSync(ConfigService.configPath)) {
      return defaults;
    }
    try {
      const raw = fs.readFileSync(ConfigService.configPath).toString();
      const obj = JSON.parse(raw) as Config;
      if (!obj.accessToken || !obj.refreshToken) {
        throw new Error('invalid');
      }

      return obj;
    } catch (e) {
      console.warn('Invalid token', e.message);
      return defaults;
    }
  }

  update(values: Partial<Config>) {
    const currentValues = this.read();

    this._values = {
      ...currentValues,
      ...values,
    };

    fs.writeFileSync(
      ConfigService.configPath,
      JSON.stringify(this._values, null, 2),
    );
  }
}
