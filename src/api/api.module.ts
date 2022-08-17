import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import axios, { AxiosRequestTransformer } from 'axios';

import { ConfigModule } from '~/config/config.module';
import { ConfigService } from '~/config/config.service';
import { OutputService } from '~/output.service';

import { AuthModule, AuthService } from '../auth';
import { ApiCommand } from './api.command';
import { ApiService } from './api.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      useFactory: (config: ConfigService, auth: AuthService) => ({
        baseURL: config.values.apiUrl,
        transformRequest: [
          (data, headers) => {
            headers.Authorization = `Bearer ${auth.get().accessToken}`;
            headers['X-Network'] = config.values.network;
            return data;
          },
          ...(axios.defaults.transformRequest as AxiosRequestTransformer[]),
        ],
      }),
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService, AuthService],
    }),
  ],
  providers: [ApiService, ApiCommand, OutputService],
})
export class CreateModule {}
