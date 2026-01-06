import z from 'zod';
import { Argument, Command, Option } from 'commander';

interface CommandBuilderOption {
  flags: string;
  description: string;
}

const getDefault = <T>(schema: z.ZodType<T>): T | undefined => {
  try {
    return schema.parse(undefined);
  } catch {
    return undefined;
  }
};

export const buildCommandFromSchema = <Shape extends z.ZodRawShape>(
  name: string,
  description: string,
  schema: z.ZodObject<Shape> | z.ZodUnion,
  args: Record<string, CommandBuilderOption>,
  options: Record<string, CommandBuilderOption>
) => {
  // Initialize command
  const command = new Command(name).description(description);

  // Initialize the shape
  let shape = {};
  if (schema instanceof z.ZodUnion) {
    for (const option of schema.options) {
      if (option instanceof z.ZodObject) {
        shape = { ...shape, ...option.shape };
      }
    }
  } else {
    shape = schema.shape;
  }

  // Go through schema
  for (const [key, fieldSchema] of Object.entries(shape)) {
    const argConfig = args?.[key];
    const optionConfig = options?.[key];

    let optionOrArgument;
    if (optionConfig !== undefined) {
      optionOrArgument = new Option(optionConfig.flags, optionConfig.description);
    } else if (argConfig !== undefined) {
      optionOrArgument = new Argument(argConfig.flags, argConfig.description);
    } else continue;

    // 1. Try to get enum choices as a set of strings
    const choices = (fieldSchema as z.ZodEnum)?.options as string[];
    if (choices) {
      optionOrArgument.choices(choices);
    }

    // 2. Try to get any default value set
    const def: any | undefined = getDefault(fieldSchema as z.ZodAny);
    if (def !== undefined) {
      optionOrArgument.default(def);
    }

    // 3. Add option/argument to command
    optionConfig !== undefined
      ? command.addOption(optionOrArgument as Option)
      : command.addArgument(optionOrArgument as Argument);
  }

  return command;
};
