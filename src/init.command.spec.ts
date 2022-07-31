import { getEmails } from './config/init.command';

test.each([
  [
    'a.b@request.network',
    'a.b+seller@request.network',
    'a.b+buyer@request.network',
  ],
  [
    'a.b+buyer@request.network',
    'a.b+seller@request.network',
    'a.b+buyer@request.network',
  ],
  [
    'a.b+seller@request.network',
    'a.b+seller@request.network',
    'a.b+buyer@request.network',
  ],
  ['a.b+1@request.network', 'a.b+1@request.network', 'a.b+2@request.network'],
  ['a.b+2@request.network', 'a.b+2@request.network', 'a.b+1@request.network'],
  [
    'a.b+233@request.network',
    'a.b+233@request.network',
    'a.b+2@request.network',
  ],
])('%s', (input, sellerEmail, buyerEmail) => {
  expect(getEmails(input)).toMatchObject({ buyerEmail, sellerEmail });
});
