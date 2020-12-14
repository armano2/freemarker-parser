import { Tokenizer } from '../src';
import ParseError from '../src/errors/ParseError';
import { Token } from '../src/interface/Tokens';

const tokenizer = new Tokenizer();

function parse(text: string): Token[] {
  try {
    return tokenizer.parse(text);
  } catch (e) {
    if (e instanceof ParseError) {
      throw new Error(`${e.message} [${e.start}-${e.end}]`);
    } else {
      throw e;
    }
  }
}

describe('errors', () => {
  it('invalid amount of brackets', () => {
    expect(() => {
      parse('<#foo foo)>');
    }).toThrowErrorMatchingSnapshot();
    expect(() => {
      parse('<#foo foo(>');
    }).toThrowErrorMatchingSnapshot();
  });

  it('unclosed comment', () => {
    expect(() => {
      parse('<#-- foo bar');
    }).toThrowErrorMatchingSnapshot();
  });

  it('missing close tag in directive', () => {
    expect(() => {
      parse('<#');
    }).toThrowErrorMatchingSnapshot();
  });

  it('missing close tag in macro', () => {
    expect(() => {
      parse('<@');
    }).toThrowErrorMatchingSnapshot();
  });
  it('invalid character in macro name', () => {
    expect(() => {
      parse('<@?');
    }).toThrowErrorMatchingSnapshot();
  });
  it('invalid character in directive name', () => {
    expect(() => {
      parse('<@&');
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('error_expresion', () => {
  it('to many close tags ]', () => {
    expect(() => {
      parse('<@foo a["foo"]]');
    }).toThrowErrorMatchingSnapshot();
  });

  it('to many close tags )', () => {
    expect(() => {
      parse('<@foo a("foo"))');
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('unclosed', () => {
  it('directive', () => {
    expect(() => {
      parse('<#foo');
    }).toThrowErrorMatchingSnapshot();
  });

  it('macro', () => {
    expect(() => {
      parse('<@foo');
    }).toThrowErrorMatchingSnapshot();
  });

  it('interpolation', () => {
    expect(() => {
      parse(`\${ foo`);
    }).toThrowErrorMatchingSnapshot();
  });
});
