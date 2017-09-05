import { ENodeType } from '../Symbols'
import { NodeNames } from './Node'
import { IExpression } from './Params'

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
  switch: NodeNames.Switch,
  case: NodeNames.SwitchCase,
  default: NodeNames.SwitchDefault,
  break: NodeNames.Break,
  // t: 't',
  // visit: 'visit',
}

export interface IToken {
  type : ENodeType
  start : number
  end : number
  params? : IExpression
  text : string
  isClose : boolean
}
