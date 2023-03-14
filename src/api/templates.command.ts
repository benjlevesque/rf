import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';

import {
  copyTemplates,
  getTemplatesByType,
  getTemplateTypes,
} from './templates';

@Injectable()
export class TemplatesCommand {
  @Command({ command: 'templates:list', describe: 'List available templates' })
  async list() {
    console.table(
      getTemplateTypes().map((type) => ({
        type,
        templates: getTemplatesByType(type).join(','),
      })),
    );
  }

  @Command({ command: 'templates:update', describe: 'Update templates' })
  async updateTemplates(
    @Option({ name: 'override', boolean: true, default: false })
    override: boolean,
  ): Promise<void> {
    const { createSpinner } = await import('nanospinner');
    const spinner = createSpinner();
    spinner.start({ text: 'Copy default templates' });

    copyTemplates(override);

    spinner.success();
  }
}
