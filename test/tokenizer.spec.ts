import * as assert from 'assert'

import {Tokenizer} from '../src'
import {IToken} from '../src/types/Tokens'
import {ENodeType} from '../src/Symbols'

const tokenizer = new Tokenizer()

function parse (text : string) : IToken[] {
  return tokenizer.parse(text)
}

class Tester {
  public static instance (tokens : IToken[]) {
    return new Tester(tokens)
  }

  private readonly tokens : IToken[]
  private index : number = 0

  private get token () {
    return this.tokens[this.index]
  }

  constructor (tokens : IToken[]) {
    this.tokens = tokens
  }

  public hasCount (value : number) {
    assert.strictEqual(this.tokens.length, value, 'Invalid amount of elements')
    return this
  }

  public nextToken () {
    ++this.index
    return this
  }

  public get (index : number) {
    this.index = index
    return this
  }

  public isType (tokenType : ENodeType) {
    assert.strictEqual(this.token.type, tokenType, `[${this.index}] Is not a ${tokenType}`)
    return this
  }

  public hasNoParams () {
    return this.hasParams()
  }

  public hasParams (params? : string) {
    assert.strictEqual(this.token.params, params, `[${this.index}] Found ${this.token.params || 'no params'} but expected ${params || 'no params'}`)
    return this
  }

  public isCloseTag (isClose : boolean) {
    assert.strictEqual(this.token.isClose, isClose, `[${this.index}] should isClose = ${isClose}`)
    return this
  }

  public hasText (text : string) {
    assert.strictEqual(this.token.text, text, `[${this.index}] text do not match`)
    return this
  }
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

describe('errors', () => {
  it('invalid amount of brackets', () => {
    try {
      parse('<#foo foo)>')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'To many close tags )', 'error message is invalid')
    }
    try {
      parse('<#foo foo(>')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Unclosed tag (', 'error message is invalid')
    }
  })
  it('unclosed comment', () => {
    try {
      parse('<#-- foo bar')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Unclosed comment', 'error message is invalid')
    }
  })
  it('missing close tag in directive', () => {
    try {
      parse('<#')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Directive name cannot be empty', 'error message is invalid')
      assert.strictEqual(e.start, 2, 'start pos is invalid')
    }
  })
  it('missing close tag in macro', () => {
    try {
      parse('<@')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Macro name cannot be empty', 'error message is invalid')
      assert.strictEqual(e.start, 2, 'start pos is invalid')
    }
  })
  it('invalid character in macro name', () => {
    try {
      parse('<@?')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Invalid `?`', 'error message is invalid')
      assert.strictEqual(e.start, 2, 'start pos is invalid')
    }
  })
  it('invalid character in directive name', () => {
    try {
      parse('<@&')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Invalid `&`', 'error message is invalid')
      assert.strictEqual(e.start, 2, 'start pos is invalid')
    }
  })
})

describe('error_expresion', () => {
  it('to many close tags ]', () => {
    try {
      parse('<@foo a["foo"]]')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'To many close tags ]', 'error message is invalid')
    }
  })
  it('to many close tags )', () => {
    try {
      parse('<@foo a("foo"))')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'To many close tags )', 'error message is invalid')
    }
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

describe('unclosed', () => {
  it('directive', () => {
    try {
      parse('<#foo')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Unclosed directive or macro', 'error message is invalid')
    }
  })
  it('macro', () => {
    try {
      parse('<@foo')
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Unclosed directive or macro', 'error message is invalid')
    }
  })

  it('interpolation', () => {
    try {
      parse(`\${ foo`)
      assert.fail('should fail')
    } catch (e) {
      assert.strictEqual(e.message, 'Unclosed directive or macro', 'error message is invalid')
    }
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
