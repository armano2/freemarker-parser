import * as assert from 'assert';
import { EOperators } from '../src/enum/Operators';
import ParamNames from '../src/enum/ParamNames';
import { ParamsParser } from '../src/ParamsParser';

function parse(template: string) {
  const parser = new ParamsParser(template);
  return parser.parseExpressions();
}

describe('params parser', () => {
  it('BinaryExpression', () => {
    const result = parse('a + 1');
    const expected = {
      type: ParamNames.BinaryExpression,
      operator: EOperators.PLUS,
      left: {
        type: ParamNames.Identifier,
        name: 'a',
      },
      right: {
        type: ParamNames.Literal,
        value: 1,
        raw: '1',
      },
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('non-literal variable', () => {
    const result = parse('foo.baz');
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
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('non-literal array', () => {
    const result = parse("foo['baz']");
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
        raw: "'baz'",
      },
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('unary prefix', () => {
    const result = parse('++foo');
    const expected = {
      type: ParamNames.UpdateExpression,
      operator: EOperators.PLUS_PLUS,
      prefix: true,
      argument: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('unary suffix', () => {
    const result = parse('foo++');
    const expected = {
      type: ParamNames.UpdateExpression,
      operator: EOperators.PLUS_PLUS,
      prefix: false,
      argument: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('toUpperCase', () => {
    const result = parse('foo?toUpperCase');
    const expected = {
      type: ParamNames.BuiltInExpression,
      left: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
      operator: EOperators.BUILT_IN,
      right: {
        type: ParamNames.Identifier,
        name: 'toUpperCase',
      },
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('array expression', () => {
    const result = parse('["","a"]');
    const expected = {
      type: ParamNames.ArrayExpression,
      elements: [
        {
          type: ParamNames.Literal,
          value: '',
          raw: '""',
        },
        {
          type: ParamNames.Literal,
          value: 'a',
          raw: '"a"',
        },
      ],
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('empty object expression', () => {
    const result = parse('{}');
    const expected = {
      type: ParamNames.MapExpression,
      elements: [],
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('object expression', () => {
    const result = parse('{"x":1,"y":2}');
    const expected = {
      type: ParamNames.MapExpression,
      elements: [
        {
          key: {
            type: ParamNames.Literal,
            value: 'x',
            raw: '"x"',
          },
          value: {
            type: ParamNames.Literal,
            value: 1,
            raw: '1',
          },
        },
        {
          key: {
            type: ParamNames.Literal,
            value: 'y',
            raw: '"y"',
          },
          value: {
            type: ParamNames.Literal,
            value: 2,
            raw: '2',
          },
        },
      ],
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
  it('to string', () => {
    const result = parse('foo?string("yes")');
    const expected = {
      type: ParamNames.BuiltInExpression,
      left: {
        type: ParamNames.Identifier,
        name: 'foo',
      },
      operator: EOperators.BUILT_IN,
      right: {
        type: ParamNames.CallExpression,
        arguments: [
          {
            type: ParamNames.Literal,
            raw: '"yes"',
            value: 'yes',
          },
        ],
        callee: {
          name: 'string',
          type: ParamNames.Identifier,
        },
      },
    };
    assert.deepStrictEqual(result, expected, 'value is not matching');
  });
});
