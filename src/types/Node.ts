import NodeNames from '../enum/NodeNames'
import { IExpression } from './Params'
import { ILoc } from './Tokens'

export interface INode extends ILoc {
  type : NodeNames
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
  params? : IExpression[]
  body? : INode[]
}

export interface IGlobal extends INode {
  type : NodeNames.Global
  params? : IExpression[]
  body? : INode[]
}

export interface ILocal extends INode {
  type : NodeNames.Local
  params? : IExpression[]
  body? : INode[]
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

export interface IFunction extends INode {
  type : NodeNames.Function
  params? : IExpression
  body : INode[]
}

export interface IReturn extends INode {
  type : NodeNames.Return
  params? : IExpression
}

export interface ICompress extends INode {
  type : NodeNames.Compress
  body : INode[]
}

export interface IImport extends INode {
  type : NodeNames.Import
  params? : IExpression
}

export interface IStop extends INode {
  type : NodeNames.Stop
  params? : IExpression
}

export type NodeSwitchGroup = ISwitchCase | ISwitchDefault

export type AllNodeTypes = IInterpolation | IMacroCall | IProgram | IText | IComment |
  ICondition | IList |
  IGlobal | ILocal | IAssign |
  IInclude | IImport |
  IMacro |
  IAttempt | IStop |
  ISwitch | ISwitchCase | ISwitchDefault |
  IBreak |
  IReturn | IFunction |
  ICompress
