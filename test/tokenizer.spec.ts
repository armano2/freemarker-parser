import { Tokenizer } from '../src'
import { IToken } from '../src/interface/Tokens'
import { ENodeType } from '../src/Symbols'
import Tester from './testers/TokenizerTester'

const tokenizer = new Tokenizer()

function parse (text : string) : IToken[] {
  return tokenizer.parse(text)
}

describe('parsing directives', () => {
  it('no arguments', () => {
    const tokens = parse('<#foo>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false)
  })
  it('no arguments, self closing', () => {
    const tokens = parse('<#foo/>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false)
  })
  it('many, no arguments', () => {
    const tokens = parse('<#foo><#foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false)
  })
  it('many, no arguments, with text', () => {
    const tokens = parse('foo<#foo>foo<#foo>foo')
    Tester.instance(tokens)
      .hasCount(5)
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
      .nextToken()
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
      .nextToken()
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
  })
  it('no arguments, with close tag', () => {
    const tokens = parse('<#foo></#foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(true)
  })
  it('with arguments', () => {
    const tokens = parse('<#foo bar>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Directive).hasParams('bar').isCloseTag(false)
  })
  it('many, with arguments', () => {
    const tokens = parse('<#foo bar><#foo bar test><#foo bar less>')
    Tester.instance(tokens)
      .hasCount(3)
      .isType(ENodeType.Directive).hasParams('bar').isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Directive).hasParams('bar test').isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Directive).hasParams('bar less').isCloseTag(false)
  })
})

describe('parsing macros', () => {
  it('no arguments', () => {
    const tokens = parse('<@foo>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(false)
  })
  it('no arguments, self closing', () => {
    const tokens = parse('<@foo/>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(false)
  })
  it('many, no arguments', () => {
    const tokens = parse('<@foo><@foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(false)
  })
  it('many, no arguments, with text', () => {
    const tokens = parse('foo<@foo>foo<@foo>foo')
    Tester.instance(tokens)
      .hasCount(5)
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
      .nextToken()
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
      .nextToken()
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
  })
  it('no arguments, with close tag', () => {
    const tokens = parse('<@foo></@foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Macro).hasParams(undefined).isCloseTag(true)
  })
  it('with arguments', () => {
    const tokens = parse('<@foo bar>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Macro).hasParams('bar').isCloseTag(false)
  })
  it('many, with arguments', () => {
    const tokens = parse('<@foo bar><@foo bar test><@foo bar less>')
    Tester.instance(tokens)
      .hasCount(3)
      .isType(ENodeType.Macro).hasParams('bar').isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Macro).hasParams('bar test').isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Macro).hasParams('bar less').isCloseTag(false)
  })
})

describe('parsing comments', () => {
  it('coment with text', () => {
    const tokens = parse('<#--  <@d></@d>  -->')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Comment).hasNoParams().isCloseTag(false).hasText('  <@d></@d>  ')
  })
  it('coment in directive', () => {
    const tokens = parse('<#foo><#--  foo  --></#foo>')
    Tester.instance(tokens)
      .hasCount(3)
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Comment).hasNoParams().isCloseTag(false).hasText('  foo  ')
      .nextToken()
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(true)
  })
})

describe('parsing text', () => {
  it('empty text', () => {
    const tokens = parse('')
    Tester.instance(tokens)
      .hasCount(0)
  })
  it('raw text', () => {
    const tokens = parse('<foo>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('<foo>')
  })
  it('text after directive', () => {
    const tokens = parse('<#foo>foo')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(false)
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
  })
  it('text before directive', () => {
    const tokens = parse('foo<#foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('foo')
      .nextToken()
      .isType(ENodeType.Directive).hasParams(undefined).isCloseTag(false)
  })
})

describe('html', () => {
  it('simple', () => {
    const tokens = parse('<p>This is include-subdir.ftl</p>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('<p>This is include-subdir.ftl</p>')
  })
  it('advance', () => {
    const tokens = parse('<p>This is include-subdir.ftl</p><#include "include-subdir2.ftl">')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Text).hasNoParams().isCloseTag(false).hasText('<p>This is include-subdir.ftl</p>')
      .nextToken()
      .isType(ENodeType.Directive).hasParams('"include-subdir2.ftl"').isCloseTag(false)
  })
})

describe('names', () => {
  it('directive', () => {
    const tokens = parse('<#foo/><#Foo/><#FoO/><#Fo_O/>')
    Tester.instance(tokens)
      .hasCount(4)
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false).hasText('foo')
      .nextToken()
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false).hasText('Foo')
      .nextToken()
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false).hasText('FoO')
      .nextToken()
      .isType(ENodeType.Directive).hasNoParams().isCloseTag(false).hasText('Fo_O')
  })
})
