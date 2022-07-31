export class Token {
  'https://request.network/metadata': Record<string, string>;
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}
