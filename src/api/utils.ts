export const parseValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const splitToKeyValue = (str: string) => {
  let [key, value] = str.split(':=');
  if (!value) {
    [key, value] = str.split('=');
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
