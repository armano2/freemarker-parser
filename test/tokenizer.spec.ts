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
      .isType(ENodeType.OpenDirective).hasNoParams()
  })
  it('no arguments, self closing', () => {
    const tokens = parse('<#foo/>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.OpenDirective).hasNoParams()
  })
  it('many, no arguments', () => {
    const tokens = parse('<#foo><#foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.OpenDirective).hasNoParams()
      .nextToken()
      .isType(ENodeType.OpenDirective).hasNoParams()
  })
  it('many, no arguments, with text', () => {
    const tokens = parse('foo<#foo>foo<#foo>foo')
    Tester.instance(tokens)
      .hasCount(5)
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasNoParams()
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasNoParams()
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
  })
  it('no arguments, with close tag', () => {
    const tokens = parse('<#foo></#foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.OpenDirective).hasNoParams()
      .nextToken()
      .isType(ENodeType.CloseDirective).hasNoParams()
  })
  it('with arguments', () => {
    const tokens = parse('<#foo bar>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.OpenDirective).hasParams('bar')
  })
  it('many, with arguments', () => {
    const tokens = parse('<#foo bar><#foo bar test><#foo bar less>')
    Tester.instance(tokens)
      .hasCount(3)
      .isType(ENodeType.OpenDirective).hasParams('bar')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasParams('bar test')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasParams('bar less')
  })
})

describe('parsing macros', () => {
  it('no arguments', () => {
    const tokens = parse('<@foo>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.OpenMacro).hasNoParams()
  })
  it('no arguments, self closing', () => {
    const tokens = parse('<@foo/>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.OpenMacro).hasNoParams()
  })
  it('many, no arguments', () => {
    const tokens = parse('<@foo><@foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.OpenMacro).hasNoParams()
      .nextToken()
      .isType(ENodeType.OpenMacro).hasNoParams()
  })
  it('many, no arguments, with text', () => {
    const tokens = parse('foo<@foo>foo<@foo>foo')
    Tester.instance(tokens)
      .hasCount(5)
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
      .nextToken()
      .isType(ENodeType.OpenMacro).hasNoParams()
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
      .nextToken()
      .isType(ENodeType.OpenMacro).hasNoParams()
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
  })
  it('no arguments, with close tag', () => {
    const tokens = parse('<@foo></@foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.OpenMacro).hasNoParams()
      .nextToken()
      .isType(ENodeType.CloseMacro).hasNoParams()
  })
  it('with arguments', () => {
    const tokens = parse('<@foo bar>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.OpenMacro).hasParams('bar')
  })
  it('many, with arguments', () => {
    const tokens = parse('<@foo bar><@foo bar test><@foo bar less>')
    Tester.instance(tokens)
      .hasCount(3)
      .isType(ENodeType.OpenMacro).hasParams('bar')
      .nextToken()
      .isType(ENodeType.OpenMacro).hasParams('bar test')
      .nextToken()
      .isType(ENodeType.OpenMacro).hasParams('bar less')
  })
})

describe('parsing comments', () => {
  it('coment with text', () => {
    const tokens = parse('<#--  <@d></@d>  -->')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Comment).hasNoParams().hasText('  <@d></@d>  ')
  })
  it('coment in directive', () => {
    const tokens = parse('<#foo><#--  foo  --></#foo>')
    Tester.instance(tokens)
      .hasCount(3)
      .isType(ENodeType.OpenDirective).hasNoParams()
      .nextToken()
      .isType(ENodeType.Comment).hasNoParams().hasText('  foo  ')
      .nextToken()
      .isType(ENodeType.CloseDirective).hasNoParams()
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
      .isType(ENodeType.Text).hasNoParams().hasText('<foo>')
  })
  it('text after directive', () => {
    const tokens = parse('<#foo>foo')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.OpenDirective).hasNoParams()
      .nextToken()
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
  })
  it('text before directive', () => {
    const tokens = parse('foo<#foo>')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Text).hasNoParams().hasText('foo')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasNoParams()
  })
})

describe('html', () => {
  it('simple', () => {
    const tokens = parse('<p>This is include-subdir.ftl</p>')
    Tester.instance(tokens)
      .hasCount(1)
      .isType(ENodeType.Text).hasNoParams().hasText('<p>This is include-subdir.ftl</p>')
  })
  it('advance', () => {
    const tokens = parse('<p>This is include-subdir.ftl</p><#include "include-subdir2.ftl">')
    Tester.instance(tokens)
      .hasCount(2)
      .isType(ENodeType.Text).hasNoParams().hasText('<p>This is include-subdir.ftl</p>')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasParams('"include-subdir2.ftl"')
  })
})

describe('names', () => {
  it('directive', () => {
    const tokens = parse('<#foo/><#Foo/><#FoO/><#Fo_O/>')
    Tester.instance(tokens)
      .hasCount(4)
      .isType(ENodeType.OpenDirective).hasNoParams().hasText('foo')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasNoParams().hasText('Foo')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasNoParams().hasText('FoO')
      .nextToken()
      .isType(ENodeType.OpenDirective).hasNoParams().hasText('Fo_O')
  })
})
