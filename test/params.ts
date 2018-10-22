import * as assert from 'assert'
import { ParamsParser } from '../src/ParamsParser'

const parser = new ParamsParser()

describe('params parser', () => {
  it('BinaryExpression', () => {
    const result = parser.parse('a + 1')
    const expected = {
      type: 'BinaryExpression',
      operator: '+',
      left: {
        type: 'Identifier',
        name: 'a',
      },
      right: {
        type: 'Literal',
        value: 1,
        raw: '1',
      },
    }
    assert.deepEqual(result, expected, 'value is not matching')
  })
})
