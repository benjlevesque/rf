import axios, { AxiosError } from 'axios';

export class SimplifiedAxiosError<T = unknown, D = any> extends Error {
  public readonly data: T;
  public readonly method: string;
  public readonly uri: string;
  public readonly status: number;
  public readonly statusText: string;
  private constructor(e: AxiosError<T, D>) {
    super(e.message);
    this.method = e.config.method?.toUpperCase();
    this.uri = axios.getUri(e.config);
    this.data = e.response?.data;
    this.status = e.response?.status;
    this.statusText = e.response?.statusText;
  }

  static from<T = unknown, D = any>(e: AxiosError<T, D>) {
    return new SimplifiedAxiosError<T, D>(e);
  }

  static convert(e: unknown) {
    return axios.isAxiosError(e) ? SimplifiedAxiosError.from(e) : e;
  }
}
