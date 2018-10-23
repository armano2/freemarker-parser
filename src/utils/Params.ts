import ParamNames from '../enum/ParamNames'
import NodeError from '../errors/NodeError'
import { ParamsParser } from '../ParamsParser'
import { AllParamTypes, IAssignmentExpression, IIdentifier, IUpdateExpression } from '../types/Params'

function cIdentifier (name : string) : IIdentifier {
  return { type: ParamNames.Identifier, name }
}

export function parseAssignParams (start : number, end : number, params? : string) : AllParamTypes[] | undefined {
  if (!params) {
    throw new NodeError('Assign require params', { start, end })
  }

  const values : AllParamTypes[] = []
  const pars = params.trim().split(/\s*[,\n\r]+\s*/)
  for (const item of pars) {
    if (!item) {
      throw new NodeError('Assign empty assign', { start, end })
    }
    /* '=' '+=' '-=' '*=' '/=' '%=' */
    let match = item.match(/^([a-zA-Z.]+)\s*((=|-=|\*=|\/=|%=|\+=)\s*(.*))?$/i)
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
      throw new NodeError('Assign invalid character', { start, end })
    }

    const operator = match[3]
    const data = match[4]
    if (operator && data) {
      values.push({
        type: ParamNames.AssignmentExpression,
        operator,
        left: cIdentifier(match[1]),
        right: paramParser(start, end, data),
      } as IAssignmentExpression)
    } else {
      const parsee = paramParser(start, end, item)
      if (parsee) {
        values.push(parsee)
      } else {
        throw new NodeError('Assign invalid character', { start, end })
      }
    }
  }
  if (values.length > 1 && values.some((item) => item.type === ParamNames.Identifier)) {
    throw new NodeError('Wrong parameters', { start, end })
  }
  return values.length > 0 ? values : undefined
}

export function paramParser (start : number, end : number, params? : string) : AllParamTypes | undefined {
  if (params) {
    const parser = new ParamsParser()
    try {
    return parser.parse(params)
    } catch (e) {
      throw new NodeError(e.message, { start: start + e.start, end })
    }
  } else {
    return undefined
  }
}
