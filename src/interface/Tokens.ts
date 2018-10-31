import { ENodeType } from '../Symbols'
import { ISourceLocation } from './ISourceLocation'

export interface ILoc {
  start : number
  end : number,
  loc? : {
    start : ISourceLocation,
    end : ISourceLocation,
  }
}

export interface IToken extends ILoc {
  type : ENodeType
  startTag? : string
  endTag? : string
  params? : string
  text : string
}
