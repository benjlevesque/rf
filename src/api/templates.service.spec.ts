import { Test } from '@nestjs/testing';

import { ConfigService } from '~/config/config.service';

import { TemplatesService } from './templates.service';
describe('TemplatesService', () => {
  let templateService: TemplatesService;

  const template = JSON.stringify({
    hardcodedValue: 'value1',
    configurableValueWithDefault: '{{configurable1:value2}}',
    configurableValueNoDefault: '{{configurable2:}}',
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [TemplatesService, ConfigService],
    })
      .overrideProvider(ConfigService)
      .useValue({
        values: {
          buyerEmail: 'buyer@mail.com',
          sellerEmail: 'seller@mail.com',
          defaults: {},
        },
      })
      .compile();

    templateService = module.get(TemplatesService);
  });

  it('Can render with no override', async () => {
    await expect(templateService.render(template, {})).resolves.toMatchObject({
      hardcodedValue: 'value1',
      configurableValueWithDefault: 'value2',
      configurableValueNoDefault: '',
    });
  });

  it('Can render with existing values overrides', async () => {
    await expect(
      templateService.render(template, {
        configurable1: 'foo',
        configurable2: 'bar',
      }),
    ).resolves.toMatchObject({
      hardcodedValue: 'value1',
      configurableValueWithDefault: 'foo',
      configurableValueNoDefault: 'bar',
    });
  });

  it('Cannot add extra keys', async () => {
    await expect(
      templateService.render(template, { extra: 'foo' }),
    ).resolves.toMatchObject({
      hardcodedValue: 'value1',
      configurableValueWithDefault: 'value2',
      configurableValueNoDefault: '',
    });
  });
});
