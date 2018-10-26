import * as assert from 'assert'
import ParamNames from '../src/enum/ParamNames'
import { ParamsParser } from '../src/ParamsParser'

const parser = new ParamsParser()

describe('params parser', () => {
  it('BinaryExpression', () => {
    const result = parser.parse('a + 1')
    const expected = {
      type: ParamNames.BinaryExpression,
      operator: '+',
      left: {
        type: ParamNames.Identifier,
        name: 'a',
      },
      right: {
        type: ParamNames.Literal,
        value: 1,
        raw: '1',
      },
    }
    assert.deepStrictEqual(result, expected, 'value is not matching')
  })
  it('non-literal variable', () => {
    const result = parser.parse('foo.baz')
    const expected = {
      type: ParamNames.MemberExpression,
      computed: false,
      object: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
      property: {
        type: ParamNames.Identifier,
        name: 'baz',
      },
    }
    assert.deepStrictEqual(result, expected, 'value is not matching')
  })
  it('non-literal array', () => {
    const result = parser.parse('foo[\'baz\']')
    const expected = {
      type: ParamNames.MemberExpression,
      computed: true,
      object: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
      property: {
        type: ParamNames.Literal,
        value: 'baz',
        raw: '\'baz\'',
      },
    }
    assert.deepStrictEqual(result, expected, 'value is not matching')
  })
  it('unary prefix', () => {
    const result = parser.parse('++foo')
    const expected = {
      type: ParamNames.UpdateExpression,
      operator: '++',
      prefix: true,
      argument: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
    }
    assert.deepStrictEqual(result, expected, 'value is not matching')
  })
  it('unary suffix', () => {
    const result = parser.parse('foo++')
    const expected = {
      type: ParamNames.UpdateExpression,
      operator: '++',
      prefix: false,
      argument: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
    }
    assert.deepStrictEqual(result, expected, 'value is not matching')
  })
})
