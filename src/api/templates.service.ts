import { Injectable } from '@nestjs/common';
import parse from 'json-templates';

import { ConfigService } from '~/config/config.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly config: ConfigService) {}

  async render(template: string, customValues: Record<string, unknown>) {
    const render = parse(JSON.parse(template.toString()));
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
      ...(this.config.values.defaults || {}),
      ...customValues,
    };

    // the return type of render is wrong. It's not a string, it's an object
    const result = render(values) as any;

    // we ignore keys that are already a parameter, to avoid conflicts
    const extraValues = Object.fromEntries(
      Object.entries(customValues).filter(
        ([key]) => !render.parameters.find((p) => p.key === key),
      ),
    );

    return {
      ...result,
      ...extraValues,
    };
  }
}
