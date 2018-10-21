import { ENodeType } from '../Symbols'

export interface IToken extends ILoc {
  type : ENodeType
  startTag? : string
  endTag? : string
  params? : string
  text : string
  isClose : boolean
}

export interface ILoc {
  start : number
  end : number
}
