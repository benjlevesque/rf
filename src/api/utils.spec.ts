import { argsToObject, parseValue, splitToKeyValue } from './utils';

describe('parseValue', () => {
  it('string', () => {
    expect(parseValue('abcd')).toBe('abcd');
  });

  it('number', () => {
    expect(parseValue('1234')).toBe(1234);
  });

  it('object', () => {
    expect(parseValue('{"foo": "bar", "baz": 1,"baz2": "2"}')).toMatchObject({
      foo: 'bar',
      baz: 1,
      baz2: '2',
    });
  });
});

describe('splitToKeyValue', () => {
  it('simple string value', () => {
    expect(splitToKeyValue('foo=bar')).toMatchObject({
      key: 'foo',
      value: 'bar',
    });
  });

  it('simple number value', () => {
    expect(splitToKeyValue('foo=1')).toMatchObject({
      key: 'foo',
      value: 1,
    });
  });

  it('object value', () => {
    expect(splitToKeyValue('foo:={"bar":"aaa", "baz": 1}')).toMatchObject({
      key: 'foo',
      value: {
        bar: 'aaa',
        baz: 1,
      },
    });
  });
});

describe('argsToObject', () => {
  it('can convert string args to object', () => {
    expect(argsToObject(['foo=bar', 'baz=1'])).toMatchObject({
      foo: 'bar',
      baz: 1,
    });
  });
});
