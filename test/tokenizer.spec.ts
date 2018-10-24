import * as assert from 'assert'

import { Tokenizer } from '../src'
import { IToken } from '../src/types/Tokens'

const tokenizer = new Tokenizer()

function parse (text : string) : IToken[] {
  return tokenizer.parse(text)
}

function isDirective (tokens : IToken[], index : number, paramsType : string | undefined, isClose : boolean) : void {
  const token = tokens[index]
  assert.strictEqual(token.type, 'Directive', `[${index}] Is not a directive`)
  assert.strictEqual(token.params, paramsType, `[${index}] Found ${token.params || 'no params'} but expected ${paramsType || 'no params'}`)
  assert.strictEqual(token.isClose, isClose, `[${index}] should isClose = ${isClose}`)
}

function isMacro (tokens : IToken[], index : number, paramsType : string | undefined, isClose : boolean) : void {
  const token = tokens[index]
  assert.strictEqual(token.type, 'Macro', `[${index}] Is not a macro`)
  assert.strictEqual(token.params, paramsType, `[${index}] Found ${token.params || 'no params'} but expected ${paramsType || 'no params'}`)
  assert.strictEqual(token.isClose, isClose, `[${index}] should isClose = ${isClose}`)
}

function isText (tokens : IToken[], index : number, text : string) : void {
  const token = tokens[index]
  assert.strictEqual(token.type, 'Text', `[${index}] Is not a text`)
  assert.strictEqual(token.params, undefined, `[${index}] Found not expected params`)
  assert.strictEqual(token.isClose, false, `[${index}] text is not allowed to have close tag`)
  assert.strictEqual(token.text, text, `[${index}] text do not match`)
}

function isComment (tokens : IToken[], index : number, text : string) : void {
  const token = tokens[index]
  assert.strictEqual(token.type, 'Comment', `[${index}] Is not a comment`)
  assert.strictEqual(token.params, undefined, `[${index}] Found not expected params`)
  assert.strictEqual(token.isClose, false, `[${index}] comment is not allowed to have close tag`)
  assert.strictEqual(token.text, text, `[${index}] comment do not match`)
}

describe('parsing directives', () => {
  it('no arguments', () => {
    const tokens = parse('<#foo>')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, undefined, false)
  })
  it('no arguments, self closing', () => {
    const tokens = parse('<#foo/>')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, undefined, false)
  })
  it('many, no arguments', () => {
    const tokens = parse('<#foo><#foo>')
    assert.strictEqual(tokens.length, 2, 'Invalid amount of elements')
    isDirective(tokens, 0, undefined, false)
    isDirective(tokens, 1, undefined, false)
  })
  it('many, no arguments, with text', () => {
    const tokens = parse('foo<#foo>foo<#foo>foo')
    assert.strictEqual(tokens.length, 5, 'Invalid amount of elements')
    isText(tokens, 0, 'foo')
    isDirective(tokens, 1, undefined, false)
    isText(tokens, 2, 'foo')
    isDirective(tokens, 3, undefined, false)
    isText(tokens, 4, 'foo')
  })
  it('no arguments, with close tag', () => {
    const tokens = parse('<#foo></#foo>')
    assert.strictEqual(tokens.length, 2, 'Invalid amount of elements')
    isDirective(tokens, 0, undefined, false)
    isDirective(tokens, 1, undefined, true)
  })
  it('with arguments', () => {
    const tokens = parse('<#foo bar>')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, 'bar', false)
  })
  it('many, with arguments', () => {
    const tokens = parse('<#foo bar><#foo bar test><#foo bar less>')
    assert.strictEqual(tokens.length, 3, 'Invalid amount of elements')
    isDirective(tokens, 0, 'bar', false)
    isDirective(tokens, 1, 'bar test', false)
    isDirective(tokens, 2, 'bar less', false)
  })
})

describe('parsing macros', () => {
  it('no arguments', () => {
    const tokens = parse('<@foo>')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isMacro(tokens, 0, undefined, false)
  })
  it('no arguments, self closing', () => {
    const tokens = parse('<@foo/>')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isMacro(tokens, 0, undefined, false)
  })
  it('many, no arguments', () => {
    const tokens = parse('<@foo><@foo>')
    assert.strictEqual(tokens.length, 2, 'Invalid amount of elements')
    isMacro(tokens, 0, undefined, false)
    isMacro(tokens, 1, undefined, false)
  })
  it('many, no arguments, with text', () => {
    const tokens = parse('foo<@foo>foo<@foo>foo')
    assert.strictEqual(tokens.length, 5, 'Invalid amount of elements')
    isText(tokens, 0, 'foo')
    isMacro(tokens, 1, undefined, false)
    isText(tokens, 2, 'foo')
    isMacro(tokens, 3, undefined, false)
    isText(tokens, 4, 'foo')
  })
  it('no arguments, with close tag', () => {
    const tokens = parse('<@foo></@foo>')
    assert.strictEqual(tokens.length, 2, 'Invalid amount of elements')
    isMacro(tokens, 0, undefined, false)
    isMacro(tokens, 1, undefined, true)
  })
  it('with arguments', () => {
    const tokens = parse('<@foo bar>')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isMacro(tokens, 0, 'bar', false)
  })
  it('many, with arguments', () => {
    const tokens = parse('<@foo bar><@foo bar test><@foo bar less>')
    assert.strictEqual(tokens.length, 3, 'Invalid amount of elements')
    isMacro(tokens, 0, 'bar', false)
    isMacro(tokens, 1, 'bar test', false)
    isMacro(tokens, 2, 'bar less', false)
  })
})

describe('parsing comments', () => {
  it('coment with text', () => {
    const tokens = parse('<#--  <@d></@d>  -->')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isComment(tokens, 0, '  <@d></@d>  ')
  })
  it('coment in directive', () => {
    const tokens = parse('<#foo><#--  foo  --></#foo>')
    assert.strictEqual(tokens.length, 3, 'Invalid amount of elements')
    isDirective(tokens, 0, undefined, false)
    isComment(tokens, 1, '  foo  ')
    isDirective(tokens, 2, undefined, true)
  })
})

describe('parsing text', () => {
  it('empty text', () => {
    const tokens = parse('')
    assert.strictEqual(tokens.length, 0, 'Invalid amount of elements')
  })
  it('raw text', () => {
    const tokens = parse('<foo>')
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isText(tokens, 0, '<foo>')
  })
  it('text after directive', () => {
    const tokens = parse('<#foo>foo')
    assert.strictEqual(tokens.length, 2, 'Invalid amount of elements')
    isDirective(tokens, 0, undefined, false)
    isText(tokens, 1, 'foo')
  })
  it('text before directive', () => {
    const tokens = parse('foo<#foo>')
    assert.strictEqual(tokens.length, 2, 'Invalid amount of elements')
    isText(tokens, 0, 'foo')
    isDirective(tokens, 1, undefined, false)
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
    assert.strictEqual(tokens.length, 1, 'Invalid amount of elements')
    isText(tokens, 0, '<p>This is include-subdir.ftl</p>')
  })
  it('advance', () => {
    const tokens = parse('<p>This is include-subdir.ftl</p><#include "include-subdir2.ftl">')
    assert.strictEqual(tokens.length, 2, 'Invalid amount of elements')
    isText(tokens, 0, '<p>This is include-subdir.ftl</p>')
    isDirective(tokens, 1, '"include-subdir2.ftl"', false)
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
