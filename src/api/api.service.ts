import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse, Method } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';

import { SimplifiedAxiosError } from '~/lib/axiosError';

import { getTemplate } from './templates';
import { TemplatesService } from './templates.service';

@Injectable()
export class ApiService {
  constructor(
    private readonly http: HttpService,
    private readonly templateService: TemplatesService,
  ) {}

  async create(
    type: string,
    template: string,
    customValues: any,
    dryRun: boolean,
  ) {
    const str = getTemplate(type, template);
    const body = await this.templateService.render(str, customValues);

    if (dryRun) {
      console.log(body);
      return;
    }
    const { id } = await this.wrapApiCall(this.http.post(`/${type}`, body));

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
