const freemarker = require('../index')
const assert = require('assert')

const tokenizer = new freemarker.Tokenizer()

function parse (text) {
  return tokenizer.parse(text)
}

function isDirective (tokens, index, paramsType, isClose) {
  const token = tokens[index]
  assert.equal(token.type, 'Directive', `[${index}] Is not a directive`)
  assert.equal(token.params.type, paramsType, `[${index}] Found ${token.params.type} but expected ${paramsType}`)
  assert.equal(token.isClose, isClose, `[${index}] should isClose = ${isClose}`)
}

function isMacro (tokens, index, paramsType, isClose) {
  const token = tokens[index]
  assert.equal(token.type, 'Macro', `[${index}] Is not a macro`)
  assert.equal(token.params.type, paramsType, `[${index}] Found ${token.params.type} but expected ${paramsType}`)
  assert.equal(token.isClose, isClose, `[${index}] should isClose = ${isClose}`)
}

function isText (tokens, index, text) {
  const token = tokens[index]
  assert.equal(token.type, 'Text', `[${index}] Is not a text`)
  assert.equal(token.params.type, 'Empty', `[${index}] Found ${token.params.type} but expected ${'Compound'}`)
  assert.equal(token.isClose, false, `[${index}] text is not allowed to have close tag`)
  assert.equal(token.text, text, `[${index}] text do not match`)
}

function isComment (tokens, index, text) {
  const token = tokens[index]
  assert.equal(token.type, 'Comment', `[${index}] Is not a comment`)
  assert.equal(token.params.type, 'Empty', `[${index}] Found ${token.params.type} but expected ${'Compound'}`)
  assert.equal(token.isClose, false, `[${index}] comment is not allowed to have close tag`)
  assert.equal(token.text, text, `[${index}] comment do not match`)
}

describe('parsing directives', function () {
  it('no arguments', function () {
    const tokens = parse('<#foo>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, 'Empty', false)
  })
  it('no arguments, self closing', function () {
    const tokens = parse('<#foo/>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, 'Empty', false)
  })
  it('many, no arguments', function () {
    const tokens = parse('<#foo><#foo>')
    assert.equal(tokens.length, 2, 'Invalid amount of elements')
    isDirective(tokens, 0, 'Empty', false)
    isDirective(tokens, 1, 'Empty', false)
  })
  it('many, no arguments, with text', function () {
    const tokens = parse('foo<#foo>foo<#foo>foo')
    assert.equal(tokens.length, 5, 'Invalid amount of elements')
    isText(tokens, 0, 'foo')
    isDirective(tokens, 1, 'Empty', false)
    isText(tokens, 2, 'foo')
    isDirective(tokens, 3, 'Empty', false)
    isText(tokens, 4, 'foo')
  })
  it('no arguments, with close tag', function () {
    const tokens = parse('<#foo></#foo>')
    assert.equal(tokens.length, 2, 'Invalid amount of elements')
    isDirective(tokens, 0, 'Empty', false)
    isDirective(tokens, 1, 'Empty', true)
  })
  it('with arguments', function () {
    const tokens = parse('<#foo bar>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, 'Identifier', false)
  })
  it('many, with arguments', function () {
    const tokens = parse('<#foo bar><#foo bar test><#foo bar less>')
    assert.equal(tokens.length, 3, 'Invalid amount of elements')
    isDirective(tokens, 0, 'Identifier', false)
    isDirective(tokens, 1, 'Compound', false)
    isDirective(tokens, 2, 'Compound', false)
  })
})

describe('parsing macros', function () {
  it('no arguments', function () {
    const tokens = parse('<@foo>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isMacro(tokens, 0, 'Empty', false)
  })
  it('no arguments, self closing', function () {
    const tokens = parse('<@foo/>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isMacro(tokens, 0, 'Empty', false)
  })
  it('many, no arguments', function () {
    const tokens = parse('<@foo><@foo>')
    assert.equal(tokens.length, 2, 'Invalid amount of elements')
    isMacro(tokens, 0, 'Empty', false)
    isMacro(tokens, 1, 'Empty', false)
  })
  it('many, no arguments, with text', function () {
    const tokens = parse('foo<@foo>foo<@foo>foo')
    assert.equal(tokens.length, 5, 'Invalid amount of elements')
    isText(tokens, 0, 'foo')
    isMacro(tokens, 1, 'Empty', false)
    isText(tokens, 2, 'foo')
    isMacro(tokens, 3, 'Empty', false)
    isText(tokens, 4, 'foo')
  })
  it('no arguments, with close tag', function () {
    const tokens = parse('<@foo></@foo>')
    assert.equal(tokens.length, 2, 'Invalid amount of elements')
    isMacro(tokens, 0, 'Empty', false)
    isMacro(tokens, 1, 'Empty', true)
  })
  it('with arguments', function () {
    const tokens = parse('<@foo bar>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isMacro(tokens, 0, 'Identifier', false)
  })
  it('many, with arguments', function () {
    const tokens = parse('<@foo bar><@foo bar test><@foo bar less>')
    assert.equal(tokens.length, 3, 'Invalid amount of elements')
    isMacro(tokens, 0, 'Identifier', false)
    isMacro(tokens, 1, 'Compound', false)
    isMacro(tokens, 2, 'Compound', false)
  })
})

describe('parsing comments', function () {
  it('coment with text', function () {
    const tokens = parse('<#--  <@d></@d>  -->')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isComment(tokens, 0, '  <@d></@d>  ')
  })
  it('coment in directive', function () {
    const tokens = parse('<#foo><#--  foo  --></#foo>')
    assert.equal(tokens.length, 3, 'Invalid amount of elements')
    isDirective(tokens, 0, 'Empty', false)
    isComment(tokens, 1, '  foo  ')
    isDirective(tokens, 2, 'Empty', true)
  })
})

describe('errors', function () {
  it('invalid amount of brackets', function () {
    try {
      parse('<#foo foo)>')
      assert.fail('should fail')
    } catch (e) {
      assert.equal(e.message, 'bracketLevel < 0', 'error message is invalid')
    }
    try {
      parse('<#foo foo(>')
      assert.fail('should fail')
    } catch (e) {
      assert.equal(e.message, 'Unclosed directive or macro', 'error message is invalid')
    }
  })
  it('unclosed comment', function () {
    try {
      parse('<#-- foo bar')
      assert.fail('should fail')
    } catch (e) {
      assert.equal(e.message, 'Unclosed comment', 'error message is invalid')
    }
  })
  it('missing close tag in directive', function () {
    try {
      parse('<#')
      assert.fail('should fail')
    } catch (e) {
      assert.equal(e.message, 'Directive name cannot be empty at character 2', 'error message is invalid')
    }
  })
  it('missing close tag in macro', function () {
    try {
      parse('<@')
      assert.fail('should fail')
    } catch (e) {
      assert.equal(e.message, 'Macro name cannot be empty at character 2', 'error message is invalid')
    }
  })
  it('invalid character in macro name', function () {
    try {
      parse('<@?')
      assert.fail('should fail')
    } catch (e) {
      assert.equal(e.message, 'Invalid `?` at character 2', 'error message is invalid')
    }
  })
  it('invalid character in directive name', function () {
    try {
      parse('<@&')
      assert.fail('should fail')
    } catch (e) {
      assert.equal(e.message, 'Invalid `&` at character 2', 'error message is invalid')
    }
  })
})

console.log(tokenizer.getNextPos(['-->'], '<#--foo', 0))
