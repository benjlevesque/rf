import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Parser from 'yargs-parser';

const getProfileArg = () => {
  const args = Parser(hideBin(process.argv));

  const argMap = {
    profile: args.profile,
    p: args.profile,
    prod: 'prod',
    staging: 'staging',
    dev: 'dev',
  };
  const profileKeys = Object.keys(args).filter((arg) => arg in argMap);
  if (profileKeys.length > 1) {
    console.error(
      `These flags cannot be used together: ${profileKeys.join(', ')}`,
    );
    process.exit(1);
  }

  if (profileKeys.length === 1) {
    return argMap[profileKeys[0]];
  }
};

let profile = getProfileArg() || 'dev';

export const getProfile = () => profile;
export const isFallbackProfile = () => !getProfileArg();
export const setProfile = (newProfile: string) => {
  profile = newProfile;
};
