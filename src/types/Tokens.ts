import { ENodeType } from '../Symbols'

export interface ILoc {
  start : number
  end : number
}

export interface IToken extends ILoc {
  type : ENodeType
  startTag? : string
  endTag? : string
  params? : string
  text : string
  isClose : boolean
}
