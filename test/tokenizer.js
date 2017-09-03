const freemarker = require('../index')
const assert = require('assert')

const tokenizer = new freemarker.Tokenizer()

function parse (text) {
  return tokenizer.parse(text)
}

function isDirective (tokens, index, paramsLength, isClose) {
  const token = tokens[index]
  assert.equal(token.type, 'Directive', `[${index}] Is not a directive`)
  assert.equal(token.params.length, paramsLength, `[${index}] Found ${token.params.length} but expected ${paramsLength}`)
  assert.equal(token.isClose, isClose, `[${index}] should isClose = ${isClose}`)
}

function isText (tokens, index) {
  const token = tokens[index]
  assert.equal(token.type, 'Text', `[${index}] Is not a text`)
  assert.equal(token.params.length, 0, `[${index}] Invalid amount of params`)
  assert.equal(token.isClose, false, `[${index}] text is not allowed to have close tag`)
}

describe('parsing directives', function () {
  it('no arguments', function () {
    const tokens = parse('<#foo>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, 0, false)
  })
  it('many, no arguments', function () {
    const tokens = parse('<#foo><#foo>')
    assert.equal(tokens.length, 2, 'Invalid amount of elements')
    isDirective(tokens, 0, 0, false)
    isDirective(tokens, 1, 0, false)
  })
  it('many, no arguments, with text', function () {
    const tokens = parse('foo<#foo>foo<#foo>foo')
    assert.equal(tokens.length, 5, 'Invalid amount of elements')
    isText(tokens, 0)
    isDirective(tokens, 1, 0, false)
    isText(tokens, 2)
    isDirective(tokens, 3, 0, false)
    isText(tokens, 4)
  })
  it('no arguments, with close tag', function () {
    const tokens = parse('<#foo></#foo>')
    assert.equal(tokens.length, 2, 'Invalid amount of elements')
    isDirective(tokens, 0, 0, false)
    isDirective(tokens, 1, 0, true)
  })
  it('with arguments', function () {
    const tokens = parse('<#foo bar>')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    isDirective(tokens, 0, 1, false)
  })
  it('many, with arguments', function () {
    const tokens = parse('<#foo bar><#foo bar test><#foo bar less>')
    assert.equal(tokens.length, 3, 'Invalid amount of elements')
    isDirective(tokens, 0, 1, false)
    isDirective(tokens, 1, 2, false)
    isDirective(tokens, 2, 2, false)
  })
})

describe('parsing comments', function () {
  it('many, no arguments', function () {
    const tokens = parse('<#--  <@d></@d>  -->')
    assert.equal(tokens.length, 1, 'Invalid amount of elements')
    assert.equal(tokens[0].type, 'Comment', 'Invalid amount of elements')
  })
})
