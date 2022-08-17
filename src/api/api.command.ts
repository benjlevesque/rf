import { Injectable } from '@nestjs/common';
import type { Method } from 'axios';
import { Command, Option } from 'nestjs-command';

import { Positional } from '~/command.decorator';
import { ConfigService } from '~/config/config.service';
import { OutputService } from '~/output.service';

import { ApiService } from './api.service';
import { getTemplate, getTemplatesByType, getTemplateTypes } from './templates';

const argsToObject = (args: string[]) => {
  return args.reduce((prev, curr) => {
    const [key, val] = curr.split('=');
    if (Number.isNaN(Number(val))) prev[key] = val;
    else prev[key] = Number(val);
    return prev;
  }, {} as Record<string, any>);
};

@Injectable()
export class ApiCommand {
  constructor(
    private readonly api: ApiService,
    private readonly output: OutputService,
    private readonly config: ConfigService,
  ) {}

  @Command({
    command: 'create <template> [values...]',
    describe: 'Create an API object based on templates',
  })
  async create(
    @Positional({
      name: 'template',
      describe: 'the template name. See the `templates:list` command',
      demandOption: true,
    })
    template: string,
    @Option({ name: 'type', default: 'invoices', choices: getTemplateTypes() })
    type: string,
    @Positional({ name: 'values', describe: 'override default values' })
    values: string[],
    @Option({ name: 'dryRun', type: 'boolean' })
    dryRun: boolean,
  ): Promise<void> {
    if (!getTemplate(type, template)) {
      console.error(
        `Template does not exist. Existing templates for ${type}: ${getTemplatesByType(
          type,
        ).join(',')}`,
      );
      return;
    }
    const id = await this.api.create(
      type,
      template,
      argsToObject(values),
      dryRun,
    );
    if (id) {
      this.output.write(id);
      this.config.lastId = id;
    }
  }

  @Command({ command: 'templates:list', describe: 'List available templates' })
  async list() {
    console.table(
      getTemplateTypes().map((type) => ({
        type,
        templates: getTemplatesByType(type).join(','),
      })),
    );
  }

  @Command({
    command: 'api <method> <path> [bodyParams...]',
    describe: 'Peform an API call',
  })
  async call(
    @Positional({
      name: 'method',
      describe: 'the http method',
      choices: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      coerce: (arg: string) => arg.toUpperCase(),
    })
    method: Method,
    @Positional({ name: 'path', describe: 'the relative path' })
    path: string,
    @Positional({
      name: 'bodyParams',
      describe: 'parameters to pass to the API call',
    })
    params: string[],
  ): Promise<void> {
    const lastId = this.config.lastId;
    const response = await this.api.call(
      method,
      path.replace(':lastId', lastId),
      argsToObject(params),
    );
    this.output.writeJson(response);
  }
}
