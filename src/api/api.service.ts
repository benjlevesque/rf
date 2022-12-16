import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse, Method } from 'axios';
import parse from 'json-templates';
import { firstValueFrom, Observable } from 'rxjs';

import { ConfigService } from '~/config/config.service';
import { SimplifiedAxiosError } from '~/lib/axiosError';

import { getTemplate } from './templates';

@Injectable()
export class ApiService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async create(
    type: string,
    template: string,
    customValues: any,
    dryRun: boolean,
  ) {
    const str = getTemplate(type, template);

    const render = parse(JSON.parse(str.toString()));
    const { faker } = await import('@faker-js/faker');
    const values = {
      ...render.parameters
        .filter((x) => x.defaultValue?.startsWith('faker'))
        .reduce((prev, { key, defaultValue }) => {
          return {
            ...prev,
            [key]: faker.helpers.fake(
              defaultValue.replace(/faker\.(.*)/, '{{$1}}'),
            ),
          };
        }, {} as Record<string, string>),
      creationDate: new Date(),
      invoiceNumber: String(Date.now()),
      buyerEmail: this.config.values.buyerEmail,
      sellerEmail: this.config.values.sellerEmail,
      ...customValues,
    };

    if (dryRun) {
      console.log(render(values));
      return;
    }
    const { id } = await this.wrapApiCall(
      this.http.post(`/${type}`, render(values)),
    );

    if (type === 'invoices') {
      const { requestId } = await this.wrapApiCall(
        this.http.post(`/invoices/${id}`),
      );
      return requestId;
    }
    return id;
  }

  call(method: Method, path: string, data: Record<string, any>) {
    return this.wrapApiCall(
      this.http.request({
        method,
        url: path,
        data,
      }),
    );
  }

  private async wrapApiCall<T>(promise: Observable<AxiosResponse<T>>) {
    try {
      const { data } = await firstValueFrom(promise);
      return data;
    } catch (e) {
      throw SimplifiedAxiosError.convert(e);
    }
  }
}
