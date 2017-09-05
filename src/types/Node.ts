import { IExpression } from './Params'

export enum NodeNames {
  Program = 'Program',
  Else = 'Else',
  Condition = 'Condition',
  Include = 'Include',
  List = 'List',
  Text = 'Text',
  Assign = 'Assign',
  Global = 'Global',
  Local = 'Local',
  Macro = 'Macro',
  MacroCall = 'MacroCall',
  Interpolation = 'Interpolation',
  Attempt = 'Attempt',
  Recover = 'Recover',
  Comment = 'Comment',
  Switch = 'Switch',
  SwitchCase = 'SwitchCase',
  SwitchDefault = 'SwitchDefault',
  Break = 'Break',

  ConditionElse = 'ConditionElse',

  // Unsupported for now
  // Function = 'Function',
    // return = 'return',
  // Flush = 'Flush',
  // Local = 'Local',
  // Lt = 'Lt',
  // Nested = 'Nested',
  // nt = 'nt',
  // recurse = 'recurse',
  // rt = 'rt',
  // setting = 'setting',
  // stop = 'stop',
  // switch = 'switch',
  //   // else = 'else',
  //   case = 'case',
  //   break = 'break',
  // t = 't',
  // visit = 'visit',
}

export interface INode {
  type : NodeNames
  start : number
  end : number
}

export interface IProgram extends INode {
  type : NodeNames.Program
  body : INode[]
}

export interface ICondition extends INode {
  type : NodeNames.Condition
  params? : IExpression
  consequent : INode[]
  alternate? : INode[]
}

export interface IInclude extends INode {
  type : NodeNames.Include
  params? : IExpression
}

export interface IList extends INode {
  type : NodeNames.List
  params? : IExpression
  body : INode[]
  fallback? : INode[]
}

export interface IText extends INode {
  type : NodeNames.Text
  text : string
}

export interface IMacro extends INode {
  type : NodeNames.Macro
  params? : IExpression
  body : INode[]
}

export interface IMacroCall extends INode {
  type : NodeNames.MacroCall
  params? : IExpression
  name : string
  body? : INode[]
}

export interface IAssign extends INode {
  type : NodeNames.Assign
  params? : IExpression
}

export interface IGlobal extends INode {
  type : NodeNames.Global
  params? : IExpression
}

export interface ILocal extends INode {
  type : NodeNames.Local
  params? : IExpression
}

export interface IInterpolation extends INode {
  type : NodeNames.Interpolation
  params? : IExpression
}

export interface IAttempt extends INode {
  type : NodeNames.Attempt
  body : INode[]
  fallback? : INode[]
}

export interface IComment extends INode {
  type : NodeNames.Comment
  text : string
}

export interface ISwitch extends INode {
  type : NodeNames.Switch
  params? : IExpression
  cases : NodeSwitchGroup[]
}

export interface ISwitchCase extends INode {
  type : NodeNames.SwitchCase
  params? : IExpression
  consequent : INode[]
}

export interface ISwitchDefault extends INode {
  type : NodeNames.SwitchDefault
  consequent : INode[]
}

export interface IBreak extends INode {
  type : NodeNames.Break
}

export type NodeSwitchGroup = ISwitchCase | ISwitchDefault

export type AllNodeTypes = IInterpolation | IMacroCall | IProgram | IText | IComment |
  ICondition | IList |
  IGlobal | ILocal | IAssign |
  IInclude |
  IMacro |
  IAttempt |
  ISwitch | ISwitchCase | ISwitchDefault |
  IBreak
