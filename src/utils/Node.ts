import { NodeNames } from '../Names'
import {
  IAssign,
  IAttempt,
  IBreak,
  IComment,
  ICondition,
  IGlobal,
  IInclude,
  IInterpolation,
  IList,
  ILocal,
  IMacro,
  IMacroCall,
  IProgram,
  ISwitch,
  ISwitchCase,
  ISwitchDefault,
  IText,
} from '../types/Node'
import { IExpression } from '../types/Params'

export function cAssign (start : number, end : number, params? : IExpression) : IAssign {
  return { type : NodeNames.Assign, start, end, params }
}

export function cGlobal (start : number, end : number, params? : IExpression) : IGlobal {
  return { type : NodeNames.Global, start, end, params }
}

export function cCondition (start : number, end : number, params? : IExpression) : ICondition {
  return { type : NodeNames.Condition, start, end, params, consequent: [] }
}

export function cList (start : number, end : number, params? : IExpression) : IList {
  return { type : NodeNames.List, start, end, params, body : [] }
}

export function cMacro (start : number, end : number, params? : IExpression) : IMacro {
  return { type : NodeNames.Macro, start, end, params, body : [] }
}

export function cProgram (start : number, end : number) : IProgram {
  return { type : NodeNames.Program, start, end, body : [] }
}

export function cMacroCall (name : string, start : number, end : number, params? : IExpression) : IMacroCall {
  return { type : NodeNames.MacroCall, start, end, name, params, body : [] }
}

export function cText (text : string, start : number, end : number) : IText {
  return { type : NodeNames.Text, start, end, text }
}

export function cInclude (start : number, end : number, params? : IExpression) : IInclude {
  return { type : NodeNames.Include, start, end, params }
}

export function cInterpolation (start : number, end : number, params? : IExpression) : IInterpolation {
  return { type : NodeNames.Interpolation, start, end, params }
}

export function cLocal (start : number, end : number, params? : IExpression) : ILocal {
  return { type : NodeNames.Local, start, end, params }
}

export function cAttempt (start : number, end : number) : IAttempt {
  return { type : NodeNames.Attempt, start, end, body : [] }
}

export function cComment (text : string, start : number, end : number) : IComment {
  return { type : NodeNames.Comment, start, end, text }
}

export function cSwitch (start : number, end : number, params? : IExpression) : ISwitch {
  return { type : NodeNames.Switch, start, end, params, cases: [] }
}

export function cSwitchCase (start : number, end : number, params? : IExpression) : ISwitchCase {
  return { type : NodeNames.SwitchCase, start, end, params, consequent: [] }
}

export function cSwitchDefault (start : number, end : number) : ISwitchDefault {
  return { type : NodeNames.SwitchDefault, start, end, consequent: [] }
}

export function cBreak (start : number, end : number) : IBreak {
  return { type : NodeNames.Break, start, end }
}
