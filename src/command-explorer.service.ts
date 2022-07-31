import { Injectable } from '@nestjs/common';
import { Injectable as IInjectable } from '@nestjs/common/interfaces';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import compact from 'lodash.compact';
import flattenDeep from 'lodash.flattendeep';
import { Arguments, Argv, CommandModule } from 'yargs';

import {
  COMMAND_HANDLER_METADATA,
  CommandMetadata,
  CommandOptionsOption,
  CommandParamMetadata,
  CommandParamMetadataItem,
  CommandParamTypes,
  CommandPositionalOption,
} from './command.decorator';

@Injectable()
export class CommandExplorerService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  explore(): CommandModule[] {
    const components = [...this.modulesContainer.values()].map(
      (module) => module.components,
    );

    return compact(
      flattenDeep<CommandModule>(
        components.map((component) =>
          [...component.values()].map(({ instance }) =>
            this.filterCommands(instance),
          ),
        ),
      ),
    );
  }

  protected filterCommands(instance: IInjectable) {
    if (!instance) return;

    const prototype = Object.getPrototypeOf(instance);
    const components = this.metadataScanner.scanFromPrototype(
      instance,
      prototype,
      (name) => this.extractMetadata(instance, prototype, name),
    );

    return components
      .filter((command) => !!command.metadata)
      .map<CommandModule>((command) => {
        const exec = instance[command.methodName].bind(instance);

        const builder: NonNullable<CommandModule['builder']> = (yargs) =>
          this.generateCommandBuilder(command.metadata.params, yargs);

        const handler: NonNullable<CommandModule['handler']> = async (args) => {
          const params = this.generateCommandHandlerParams(
            command.metadata.params,
            args,
          );
          await exec(...params);
        };

        return {
          ...command.metadata.option,
          builder,
          handler,
        };
      });
  }

  protected extractMetadata(instance, prototype, methodName: string) {
    const callback = prototype[methodName];
    const metadata: CommandMetadata = Reflect.getMetadata(
      COMMAND_HANDLER_METADATA,
      callback,
    );

    return {
      methodName,
      metadata,
    };
  }

  protected iteratorParamMetadata<O>(
    params: CommandParamMetadata<O>,
    callback: (item: CommandParamMetadataItem<O>, key: string) => void,
  ) {
    if (!params) {
      return;
    }

    Object.keys(params).forEach((key) => {
      const param: CommandParamMetadataItem<O>[] = params[key];
      if (!param || !Array.isArray(param)) {
        return;
      }

      param.forEach((metadata) => callback(metadata, key));
    });
  }

  private generateCommandHandlerParams(
    params: CommandParamMetadata<
      CommandOptionsOption | CommandPositionalOption
    >,
    argv: Arguments,
  ) {
    const list = [];

    this.iteratorParamMetadata(params, (item, key) => {
      switch (key) {
        case CommandParamTypes.OPTION:
          list[item.index] = argv[(item.option as CommandOptionsOption).name];
          break;

        case CommandParamTypes.POSITIONAL:
          list[item.index] =
            argv[(item.option as CommandPositionalOption).name];
          break;

        case CommandParamTypes.ARGV:
          list[item.index] = argv;

        default:
          break;
      }
    });

    return list;
  }

  private generateCommandBuilder(
    params: CommandParamMetadata<
      CommandOptionsOption | CommandPositionalOption
    >,
    yargs: Argv,
  ) {
    this.iteratorParamMetadata(params, (item, key) => {
      switch (key) {
        case CommandParamTypes.OPTION:
          yargs.option(
            (item.option as CommandOptionsOption).name,
            item.option as CommandOptionsOption,
          );
          break;

        case CommandParamTypes.POSITIONAL:
          yargs.positional(
            (item.option as CommandPositionalOption).name,
            item.option as CommandPositionalOption,
          );
          break;

        default:
          break;
      }
    });

    return yargs;
  }
}
