import { hideBin } from 'yargs/helpers';
import Parser from 'yargs-parser';

const initProfile = () => {
  const args = Parser(hideBin(process.argv));

  const profile: string = args.profile || args.p;
  if (profile && (args.dev || args.prod)) {
    console.error('Cannot specify --dev or --prod together with a profile');
    process.exit(1);
  }
  if (args.prod) return 'prod';
  if (args.staging) return 'staging';
  if (args.dev) return 'dev';

  return profile;
};

let profile = initProfile();

export const getProfile = () => profile;
export const setProfile = (newProfile: string) => {
  profile = newProfile;
};
