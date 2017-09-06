import { ParamsParser } from '../ParamsParser'
import { ENodeType } from '../Symbols'
import { IToken } from '../types/Tokens'

export function cToken (type : ENodeType, start : number, end : number, text : string, isClose : boolean, params? : string) : IToken {
  if (params) {
    const parser = new ParamsParser()
    return {
      type,
      start,
      end,
      text,
      params: parser.parse(params),
      isClose,
    }
  } else {
    return {
      type,
      start,
      end,
      text,
      isClose,
    }
  }
}
