export const parseValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    // yargs transforms \n to \\n.
    return value?.replace('\\n', '\n');
  }
};

export const splitToKeyValue = (str: string) => {
  let value = '';
  let [key, ...values] = str.split(':=');
  value = values.join(':=');
  if (!value) {
    [key, ...values] = str.split('=');
    value = values.join('=');
  }
  return { key, value: parseValue(value) };
};

export const argsToObject = (args: string[]) => {
  return args.reduce((prev, curr) => {
    const { key, value } = splitToKeyValue(curr);
    prev[key] = value;
    return prev;
  }, {} as Record<string, any>);
};
