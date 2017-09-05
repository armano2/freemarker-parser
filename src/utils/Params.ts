import { ParamsParser } from '../ParamsParser'
import { ENodeType } from '../Symbols'
import { ParamNames } from '../types/Params'
import { IToken } from '../types/Tokens'

export function cToken (type : ENodeType, start : number, end : number, text : string, params : string = '', isClose : boolean = false) : IToken {
  const parser = new ParamsParser()
  return {
    type,
    start,
    end,
    text,
    params: params !== '' ? parser.parse(params) : {
      type : ParamNames.Empty,
    },
    isClose,
  }
}
