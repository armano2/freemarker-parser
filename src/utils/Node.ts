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
  NodeNames,
} from '../types/Node'
import { IExpression } from '../types/Params'

export function cAssign (params : IExpression, start : number, end : number) : IAssign {
  return { type : NodeNames.Assign, start, end, params }
}

export function cGlobal (params : IExpression, start : number, end : number) : IGlobal {
  return { type : NodeNames.Global, start, end, params }
}

export function cCondition (params : IExpression, start : number, end : number) : ICondition {
  return { type : NodeNames.Condition, start, end, params, consequent: [] }
}

export function cList (params : IExpression, start : number, end : number) : IList {
  return { type : NodeNames.List, start, end, params, body : [] }
}

export function cMacro (params : IExpression, start : number, end : number) : IMacro {
  return { type : NodeNames.Macro, start, end, params, body : [] }
}

export function cProgram (start : number, end : number) : IProgram {
  return { type : NodeNames.Program, start, end, body : [] }
}

export function cMacroCall (params : IExpression, name : string, start : number, end : number) : IMacroCall {
  return { type : NodeNames.MacroCall, start, end, name, params, body : [] }
}

export function cText (text : string, start : number, end : number) : IText {
  return { type : NodeNames.Text, start, end, text }
}

export function cInclude (params : IExpression, start : number, end : number) : IInclude {
  return { type : NodeNames.Include, start, end, params }
}

export function cInterpolation (params : IExpression, start : number, end : number) : IInterpolation {
  return { type : NodeNames.Interpolation, start, end, params }
}

export function cLocal (params : IExpression, start : number, end : number) : ILocal {
  return { type : NodeNames.Local, start, end, params }
}

export function cAttempt (start : number, end : number) : IAttempt {
  return { type : NodeNames.Attempt, start, end, body : [] }
}

export function cComment (text : string, start : number, end : number) : IComment {
  return { type : NodeNames.Comment, start, end, text }
}

export function cSwitch (params : IExpression, start : number, end : number) : ISwitch {
  return { type : NodeNames.Switch, start, end, params, cases: [] }
}

export function cSwitchCase (params : IExpression, start : number, end : number) : ISwitchCase {
  return { type : NodeNames.SwitchCase, start, end, params, consequent: [] }
}

export function cSwitchDefault (start : number, end : number) : ISwitchDefault {
  return { type : NodeNames.SwitchDefault, start, end, consequent: [] }
}

export function cBreak (start : number, end : number) : IBreak {
  return { type : NodeNames.Break, start, end }
}
