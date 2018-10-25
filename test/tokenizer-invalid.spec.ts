import * as assert from 'assert'

import { Tokenizer } from '../src'
import { IToken } from '../src/types/Tokens'

const tokenizer = new Tokenizer()

function parse (text : string) : IToken[] {
  return tokenizer.parse(text)
}

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
