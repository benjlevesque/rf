import 'reflect-metadata';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';

export const COMMAND_COMPLETION_METADATA = '__command-completion-metadata__';

/**
 * Registers the current method for completion of `commandName`
 */
export const Completion = (commandName: string): MethodDecorator => {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      COMMAND_COMPLETION_METADATA,
      { name: commandName },
      target,
      propertyKey,
    );
    return target;
  };
};

@Injectable()
export class CompletionService implements OnModuleInit {
  private completions: Record<string, (current: string, argv: any) => string[]>;
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
  ) {
    this.getCompletion = this.getCompletion.bind(this);
  }

  onModuleInit() {
    this.completions = this.getCompletions();
  }

  /**
   * Finds all completion functions by reflection
   */
  getCompletions() {
    const components = [...this.modulesContainer.values()].map(
      (module) => module.components,
    );

    const instances = components
      .map((component) => [...component.values()].map((x) => x.instance))
      .flat();
    const completions = instances
      .filter(Boolean)
      .map((instance) => {
        if (typeof instance !== 'object') return;
        return this.metadataScanner.scanFromPrototype(
          instance,
          Object.getPrototypeOf(instance),
          (name) => {
            const meta = Reflect.hasMetadata(
              COMMAND_COMPLETION_METADATA,
              instance,
              name,
            )
              ? Reflect.getMetadata(COMMAND_COMPLETION_METADATA, instance, name)
              : undefined;
            if (meta && instance) {
              return {
                name: meta.name,
                callback: instance[name] as any,
              };
            }
          },
        );
      })
      .flat()
      .filter(Boolean)
      .reduce(
        (prev, curr) => ({ ...prev, [curr.name]: curr.callback }),
        {} as Record<string, (current: string, argv: any) => string[]>,
      );

    return completions;
  }

  /**
   * Gets the completion for the current command
   *
   * @returns any because yargs requires to have 4 parameters for this to work,
   * but the types don't expose that possibility
   */
  getCompletion: any = (
    current: string,
    argv: { _: string[] },
    completionFilter: (onCompleted?: CompletionCallback) => any,
    done: (completions: string[]) => void,
  ) => {
    const cmd = argv._[1];
    if (this.completions[cmd]) {
      const results = this.completions[cmd](current, argv);
      if (results && results.length) {
        done(results);
      } else {
        completionFilter();
      }
    } else {
      completionFilter();
    }
  };
}

type CompletionCallback = (
  err: Error | null,
  completions: string[] | undefined,
) => void;
