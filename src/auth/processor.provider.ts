import {
  Auth0LoginProcessor,
  Config,
  tryGetComboToken,
} from '@altostra/cli-login-auth0';
import { Provider } from '@nestjs/common';
import path from 'path';

import { ConfigService } from '~/config/config.service';

export const loginProcessorProvider: Provider = {
  provide: Auth0LoginProcessor,
  useFactory: (config: ConfigService) => {
    const auth0LoginProcessConfig: Config = {
      auth0ClientId: config.values.auth0ClientId || '',
      auth0Domain: config.values.auth0Domain || '',
      auth0TokenAudience: '',
      auth0TokenScope: config.values.auth0TokenScope || '',
      port: config.values.port || 3333,
      timeout: 30000,
      successfulLoginHtmlFile: path.resolve(
        require.main.path,
        '..',
        'html',
        'success.html',
      ),
      failedLoginHtmlFile: path.resolve(
        require.main.path,
        '..',
        'html',
        'failure.html',
      ),
    };
    if (config.values.auth0Organization) {
      // this hacks the authorize request to add the organization parameter
      // see https://github.com/altostra/altostra-cli-login-auth0/blob/43ff8fd106b8fbfd907fbcc0040226ac17a645da/src/Auth0LoginProcessor.ts#L170
      auth0LoginProcessConfig.auth0TokenAudience += `&organization=${config.values.auth0Organization}`;
    }
    return new Auth0LoginProcessor(auth0LoginProcessConfig, tryGetComboToken);
  },
  inject: [ConfigService],
};
