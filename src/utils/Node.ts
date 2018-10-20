import { NodeNames, ParamNames } from '../Names'
import { ENodeType } from '../Symbols'
import {
  IAssign,
  IAttempt,
  IBreak,
  IComment,
  ICompress,
  ICondition,
  IFunction,
  IGlobal,
  IInclude,
  IInterpolation,
  IList,
  ILocal,
  IMacro,
  IMacroCall,
  IProgram,
  IReturn,
  ISwitch,
  ISwitchCase,
  ISwitchDefault,
  IText,
} from '../types/Node'
import { IToken } from '../types/Tokens'
import { paramParser, parseAssignParams } from './Params'

export function cAssign (start : number, end : number, paramsText? : string) : IAssign {
  const params = parseAssignParams(start, end, paramsText)
  const body = params && params.length === 1 && params[0].type === ParamNames.Identifier ? [] : undefined
  return { type : NodeNames.Assign, start, end, params, body }
}

export function cGlobal (start : number, end : number, paramsText? : string) : IGlobal {
  const params = parseAssignParams(start, end, paramsText)
  const body = params && params.length === 1 && params[0].type === ParamNames.Identifier ? [] : undefined
  return { type : NodeNames.Global, start, end, params, body }
}

export function cLocal (start : number, end : number, paramsText? : string) : ILocal {
  const params = parseAssignParams(start, end, paramsText)
  const body = params && params.length === 1 && params[0].type === ParamNames.Identifier ? [] : undefined
  return { type : NodeNames.Local, start, end, params, body }
}

export function cCondition (start : number, end : number, params? : string) : ICondition {
  return { type : NodeNames.Condition, start, end, params: paramParser(start, end, params), consequent: [] }
}

export function cList (start : number, end : number, params? : string) : IList {
  return { type : NodeNames.List, start, end, params: paramParser(start, end, params), body : [] }
}

export function cMacro (start : number, end : number, params? : string) : IMacro {
  return { type : NodeNames.Macro, start, end, params: paramParser(start, end, params), body : [] }
}

export function cProgram (start : number, end : number) : IProgram {
  return { type : NodeNames.Program, start, end, body : [] }
}

export function cMacroCall (name : string, start : number, end : number, endTag? : string, params? : string) : IMacroCall {
  const body = endTag === '/>' ? undefined : []
  return { type : NodeNames.MacroCall, start, end, name, params: paramParser(start, end, params), body }
}

export function cText (text : string, start : number, end : number) : IText {
  return { type : NodeNames.Text, start, end, text }
}

export function cInclude (start : number, end : number, params? : string) : IInclude {
  return { type : NodeNames.Include, start, end, params: paramParser(start, end, params) }
}

export function cInterpolation (start : number, end : number, params? : string) : IInterpolation {
  return { type : NodeNames.Interpolation, start, end, params: paramParser(start, end, params) }
}

export function cAttempt (start : number, end : number) : IAttempt {
  return { type : NodeNames.Attempt, start, end, body : [] }
}

export function cComment (text : string, start : number, end : number) : IComment {
  return { type : NodeNames.Comment, start, end, text }
}

export function cSwitch (start : number, end : number, params? : string) : ISwitch {
  return { type : NodeNames.Switch, start, end, params: paramParser(start, end, params), cases: [] }
}

export function cSwitchCase (start : number, end : number, params? : string) : ISwitchCase {
  return { type : NodeNames.SwitchCase, start, end, params: paramParser(start, end, params), consequent: [] }
}

export function cSwitchDefault (start : number, end : number) : ISwitchDefault {
  return { type : NodeNames.SwitchDefault, start, end, consequent: [] }
}

export function cBreak (start : number, end : number) : IBreak {
  return { type : NodeNames.Break, start, end }
}

export function cFunction (start : number, end : number, params? : string) : IFunction {
  return { type : NodeNames.Function, start, end, params: paramParser(start, end, params), body: [] }
}

export function cReturn (start : number, end : number, params? : string) : IReturn {
  return { type : NodeNames.Return, start, end, params: paramParser(start, end, params) }
}

export function cCompress (start : number, end : number) : ICompress {
  return { type : NodeNames.Compress, start, end, body : [] }
}

export function cToken (type : ENodeType, start : number, end : number, text : string, isClose : boolean, startTag? : string, endTag? : string, params? : string) : IToken {
  return {
    type,
    start,
    end,
    startTag,
    endTag,
    text,
    params: params || undefined,
    isClose,
  }
}
