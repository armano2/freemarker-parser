import { NodeNames } from '../nodes/Types'
import { ENodeType } from '../Symbols'
import { IParams } from '../Types'
import { parseParams } from '../utils/Params'

export interface IDirectivesTypes {
  [n : string] : NodeNames
}

export const directives : IDirectivesTypes = {
  if: NodeNames.Condition,
  else: NodeNames.Else,
  elseif: NodeNames.ConditionElse,
  list: NodeNames.List,
  include: NodeNames.Include,
  assign: NodeNames.Assign,
  attempt: NodeNames.Attempt,
  // compress: 'compress',
  // escape: 'escape',
  // noescape: 'noescape',
  // fallback: 'fallback',
  // function: 'function',
  // flush: 'flush',
  global: NodeNames.Global,
  // import: 'import',
  local: NodeNames.Local,
  // lt: 'lt',
  macro: NodeNames.Macro,
  // nested: 'nested',
  // nt: 'nt',
  recover: NodeNames.Recover,
  // recurse: 'recurse',
  // return: 'return',
  // rt: 'rt',
  // setting: 'setting',
  // stop: 'stop',
  // switch: 'switch',
  // case: 'case',
  // break: 'break',
  // t: 't',
  // visit: 'visit',
}

export interface IToken {
  type : ENodeType
  start : number
  end : number
  params : IParams
  text : string
  isClose : boolean
}

export function cToken (type : ENodeType, start : number, end : number, text : string, params : string[] = [], isClose : boolean = false) : IToken {
  return {
    type,
    start,
    end,
    params: parseParams(params),
    text,
    isClose,
  }
}
