import { ENodeType } from '../Symbols'
import { IToken } from '../types/Tokens'

export function cToken (type : ENodeType, start : number, end : number, text : string, isClose : boolean, params? : string) : IToken {
  return {
    type,
    start,
    end,
    text,
    params: params || undefined,
    isClose,
  }
}
