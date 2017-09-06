import { NodeNames } from '../Names'
import { ENodeType } from '../Symbols'

export interface IDirectivesTypes {
  [n : string] : NodeNames
}

export interface IToken extends ILoc {
  type : ENodeType
  params? : string
  text : string
  isClose : boolean
}

export interface ILoc {
  start : number
  end : number
}
