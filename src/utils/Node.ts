import { NodeNames } from '../Names'
import { ParamsParser } from '../ParamsParser'
import {
  IAssign,
  IAttempt,
  IBreak,
  IComment,
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
import { IExpression } from '../types/Params'

function paramParser (params? : string) : IExpression | undefined {
  if (params) {
    const parser = new ParamsParser()
    return parser.parse(params)
  } else {
    return undefined
  }
}

function parseAssignParams (params? : string) : IExpression[] | undefined {
  if (!params) {
    return undefined
  }

  const values : IExpression[] = []
  const pars = params.trim().split(/\s*[,\n\r]+\s*/)
  for (const item of pars) {
    const tm = paramParser(item)
    if (tm) {
      values.push(tm)
    }
  }
  return values.length > 0 ? values : undefined
}

export function cAssign (start : number, end : number, params? : string) : IAssign {
  return { type : NodeNames.Assign, start, end, params: parseAssignParams(params) }
}

export function cGlobal (start : number, end : number, params? : string) : IGlobal {
  return { type : NodeNames.Global, start, end, params: parseAssignParams(params) }
}

export function cLocal (start : number, end : number, params? : string) : ILocal {
  return { type : NodeNames.Local, start, end, params: parseAssignParams(params) }
}

export function cCondition (start : number, end : number, params? : string) : ICondition {
  return { type : NodeNames.Condition, start, end, params: paramParser(params), consequent: [] }
}

export function cList (start : number, end : number, params? : string) : IList {
  return { type : NodeNames.List, start, end, params: paramParser(params), body : [] }
}

export function cMacro (start : number, end : number, params? : string) : IMacro {
  return { type : NodeNames.Macro, start, end, params: paramParser(params), body : [] }
}

export function cProgram (start : number, end : number) : IProgram {
  return { type : NodeNames.Program, start, end, body : [] }
}

export function cMacroCall (name : string, start : number, end : number, params? : string) : IMacroCall {
  return { type : NodeNames.MacroCall, start, end, name, params: paramParser(params), body : [] }
}

export function cText (text : string, start : number, end : number) : IText {
  return { type : NodeNames.Text, start, end, text }
}

export function cInclude (start : number, end : number, params? : string) : IInclude {
  return { type : NodeNames.Include, start, end, params: paramParser(params) }
}

export function cInterpolation (start : number, end : number, params? : string) : IInterpolation {
  return { type : NodeNames.Interpolation, start, end, params: paramParser(params) }
}

export function cAttempt (start : number, end : number) : IAttempt {
  return { type : NodeNames.Attempt, start, end, body : [] }
}

export function cComment (text : string, start : number, end : number) : IComment {
  return { type : NodeNames.Comment, start, end, text }
}

export function cSwitch (start : number, end : number, params? : string) : ISwitch {
  return { type : NodeNames.Switch, start, end, params: paramParser(params), cases: [] }
}

export function cSwitchCase (start : number, end : number, params? : string) : ISwitchCase {
  return { type : NodeNames.SwitchCase, start, end, params: paramParser(params), consequent: [] }
}

export function cSwitchDefault (start : number, end : number) : ISwitchDefault {
  return { type : NodeNames.SwitchDefault, start, end, consequent: [] }
}

export function cBreak (start : number, end : number) : IBreak {
  return { type : NodeNames.Break, start, end }
}

export function cFunction (start : number, end : number, params? : string) : IFunction {
  return { type : NodeNames.Function, start, end, params: paramParser(params), body: [] }
}

export function cReturn (start : number, end : number, params? : string) : IReturn {
  return { type : NodeNames.Return, start, end, params: paramParser(params) }
}
