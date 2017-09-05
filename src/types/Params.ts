import { ParamNames } from '../Names'

export interface IExpression {
  type : ParamNames
}

export interface ICompound extends IExpression {
  type : ParamNames.Compound
  body : AllParamTypes[]
}

export interface ILiteral extends IExpression {
  type : ParamNames.Literal
  value : any
  raw : string
}

export interface IArrayExpression extends IExpression {
  type : ParamNames.ArrayExpression
  elements : AllParamTypes[]
}

export interface IIdentifier extends IExpression {
  type : ParamNames.Identifier
  name : string
}

export interface IBinaryExpression extends IExpression {
  type : ParamNames.BinaryExpression
  operator : string
  left : AllParamTypes
  right : AllParamTypes
}

export interface ILogicalExpression extends IExpression {
  type : ParamNames.LogicalExpression
  operator : string
  left : AllParamTypes
  right : AllParamTypes
}

export interface IUnaryExpression extends IExpression {
  type : ParamNames.UnaryExpression
  operator : string
  argument : AllParamTypes
  prefix : boolean
}

export interface IMemberExpression extends IExpression {
  type : ParamNames.MemberExpression
  computed : boolean
  object : AllParamTypes
  property : AllParamTypes | null
}

export interface ICallExpression extends IExpression {
  type : ParamNames.CallExpression
  arguments : AllParamTypes[]
  callee : AllParamTypes
}

export type AllParamTypes = ILiteral | IArrayExpression | IIdentifier |
  IBinaryExpression | ILogicalExpression | IUnaryExpression |
  IMemberExpression | ICallExpression | ICompound
