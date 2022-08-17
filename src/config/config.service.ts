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

  get lastId() {
    if (fs.existsSync(PATH_TO_LAST_REQUEST_ID))
      return fs.readFileSync(PATH_TO_LAST_REQUEST_ID).toString();
    return null;
  }

  set lastId(id: string) {
    fs.writeFileSync(PATH_TO_LAST_REQUEST_ID, id);
  }
}
