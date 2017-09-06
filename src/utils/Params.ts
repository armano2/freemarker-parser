import { ParamNames } from '../Names'
import { ParamsParser } from '../ParamsParser'
import { AllParamTypes, IAssignmentExpression, IExpression, IIdentifier, IUpdateExpression } from '../types/Params'

function cIdentifier (name : string) : IIdentifier {
  return { type: ParamNames.Identifier, name }
}

export function parseAssignParams (params? : string) : IExpression[] | undefined {
  if (!params) {
    throw new SyntaxError('Assign require params')
  }

  const values : AllParamTypes[] = []
  const pars = params.trim().split(/\s*[,\n\r]+\s*/)
  for (const item of pars) {
    if (!item) {
      throw new SyntaxError('Assign empty assign')
    }
    /* '=' '+=' '-=' '*=' '/=' '%=' */
    let match = item.match(/^([a-zA-Z\.]+)\s*((=|-=|\*=|\/=|%=|\+=)\s*(.*))?$/i)
    if (!match) {
      match = item.match(/^\s*(\+\+|--)?([a-zA-Z.]+)(\+\+|--)?\s*$/i)
      if (match && match[2] && (match[1] || match[3])) {
        values.push({
          type: ParamNames.UpdateExpression,
          operator: match[1] || match[3],
          prefix: Boolean(match[1]),
          argument: cIdentifier(match[2]),
        } as IUpdateExpression)
        continue
      }
      throw new SyntaxError('Assign invalid character')
    }

    const operator = match[3]
    const data = match[4]
    if (operator && data) {
      values.push({
        type: ParamNames.AssignmentExpression,
        operator,
        left: cIdentifier(match[1]),
        right: paramParser(data),
      } as IAssignmentExpression)
    } else {
      const parsee = paramParser(item)
      if (parsee) {
        values.push(parsee)
      } else {
        throw new SyntaxError('Assign invalid character')
      }
    }
  }
  if (values.length > 0 && values.some((item) => item.type === ParamNames.Identifier)) {
    throw new SyntaxError('Wrong parameters')
  }
  return values.length > 0 ? values : undefined
}

export function paramParser (params? : string) : AllParamTypes | undefined {
  if (params) {
    const parser = new ParamsParser()
    return parser.parse(params)
  } else {
    return undefined
  }
}
