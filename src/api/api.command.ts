import { Injectable } from '@nestjs/common';
import type { Method } from 'axios';
import parse from 'json-templates';
import { Command, Option } from 'nestjs-command';

import { Positional } from '~/command.decorator';
import { Completion } from '~/completion';
import { ConfigService } from '~/config/config.service';
import { OutputService } from '~/output.service';

import { ApiService } from './api.service';
import { getTemplate, getTemplatesByType, getTemplateTypes } from './templates';
import { argsToObject } from './utils';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

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
    @Option({
      name: 'type',
      default: 'invoices',
      choices: getTemplateTypes(),
      describe: 'The type of object to create',
    })
    type: string,
    @Positional({ name: 'values', describe: 'override default values' })
    values: string[],
    @Option({ name: 'dryRun', type: 'boolean', describe: 'Run a simulation' })
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

  @Completion('create')
  createCompletion(_current: string, argv: any) {
    const templates = getTemplatesByType(argv.type);
    const template = argv._[2];
    if (template && templates.includes(template)) {
      return parse(getTemplate(argv.type, template))
        .parameters.filter(
          (param) => !argv._.find((arg) => arg.startsWith(param.key + '=')),
        )
        .map((param) => param.key + '=:' + param.defaultValue);
    }
    return templates.map((x) => x + ':Templates');
  }

  @Command({
    command: 'api <method> <path> [values...]',
    describe: 'Peform an API call',
  })
  async call(
    @Positional({
      name: 'method',
      describe: 'the http method',
      choices: METHODS,
      demandOption: true,
      coerce: (arg: string) => arg.toUpperCase(),
    })
    method: Method,
    @Positional({ name: 'path', describe: 'the relative path' })
    path: string,
    @Positional({
      name: 'values',
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

  @Completion('api')
  callCompletion(_, argv: any) {
    if (argv._.some((x) => METHODS.includes(x))) return [];
    return METHODS.map((x) => x + ':HTTP Methods');
  }
}
