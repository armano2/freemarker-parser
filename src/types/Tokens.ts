import { NodeNames } from '../Names'
import { ENodeType } from '../Symbols'
import { IExpression } from './Params'

export interface IDirectivesTypes {
  [n : string] : NodeNames
}

export interface IToken extends ILoc {
  type : ENodeType
  params? : IExpression
  text : string
  isClose : boolean
}

export interface ILoc {
  start : number
  end : number
}
