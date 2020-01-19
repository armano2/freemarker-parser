import { Tokenizer } from '../src';
import { Token } from '../src/interface/Tokens';

const tokenizer = new Tokenizer();

function parse(text: string): Token[] {
  return tokenizer.parse(text);
}

describe('parsing directives', () => {
  it('no arguments', () => {
    const tokens = parse('<#foo>');
    expect(tokens).toMatchSnapshot();
  });

  it('no arguments, self-closing', () => {
    const tokens = parse('<#foo/>');
    expect(tokens).toMatchSnapshot();
  });

  it('many, no arguments', () => {
    const tokens = parse('<#foo><#foo>');
    expect(tokens).toMatchSnapshot();
  });

  it('many, no arguments, with text', () => {
    const tokens = parse('foo<#foo>foo<#foo>foo');
    expect(tokens).toMatchSnapshot();
  });

  it('no arguments, with close tag', () => {
    const tokens = parse('<#foo></#foo>');
    expect(tokens).toMatchSnapshot();
  });

  it('with arguments', () => {
    const tokens = parse('<#foo bar>');
    expect(tokens).toMatchSnapshot();
  });

  it('many, with arguments', () => {
    const tokens = parse('<#foo bar><#foo bar test><#foo bar less>');
    expect(tokens).toMatchSnapshot();
  });
});

describe('parsing macros', () => {
  it('no arguments', () => {
    const tokens = parse('<@foo>');
    expect(tokens).toMatchSnapshot();
  });

  it('no arguments, self-closing', () => {
    const tokens = parse('<@foo/>');
    expect(tokens).toMatchSnapshot();
  });

  it('many, no arguments', () => {
    const tokens = parse('<@foo><@foo>');
    expect(tokens).toMatchSnapshot();
  });

  it('many, no arguments, with text', () => {
    const tokens = parse('foo<@foo>foo<@foo>foo');
    expect(tokens).toMatchSnapshot();
  });

  it('no arguments, with close tag', () => {
    const tokens = parse('<@foo></@foo>');
    expect(tokens).toMatchSnapshot();
  });

  it('with arguments', () => {
    const tokens = parse('<@foo bar>');
    expect(tokens).toMatchSnapshot();
  });

  it('many, with arguments', () => {
    const tokens = parse('<@foo bar><@foo bar test><@foo bar less>');
    expect(tokens).toMatchSnapshot();
  });
});

describe('parsing comments', () => {
  it('coment with text', () => {
    const tokens = parse('<#--  <@d></@d>  -->');
    expect(tokens).toMatchSnapshot();
  });

  it('coment in directive', () => {
    const tokens = parse('<#foo><#--  foo  --></#foo>');
    expect(tokens).toMatchSnapshot();
  });
});

describe('parsing text', () => {
  it('empty text', () => {
    const tokens = parse('');
    expect(tokens).toMatchSnapshot();
  });

  it('raw text', () => {
    const tokens = parse('<foo>');
    expect(tokens).toMatchSnapshot();
  });

  it('text after directive', () => {
    const tokens = parse('<#foo>foo');
    expect(tokens).toMatchSnapshot();
  });

  it('text before directive', () => {
    const tokens = parse('foo<#foo>');
    expect(tokens).toMatchSnapshot();
  });
});

describe('html', () => {
  it('simple', () => {
    const tokens = parse('<p>This is include-subdir.ftl</p>');
    expect(tokens).toMatchSnapshot();
  });

  it('advance', () => {
    const tokens = parse(
      '<p>This is include-subdir.ftl</p><#include "include-subdir2.ftl">',
    );
    expect(tokens).toMatchSnapshot();
  });
});

describe('names', () => {
  it('directive', () => {
    const tokens = parse('<#foo/><#Foo/><#FoO/><#Fo_O/>');
    expect(tokens).toMatchSnapshot();
  });
});
