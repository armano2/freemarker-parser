import {
  IAssign,
  IAttempt,
  ICondition,
  IElse,
  IGlobal,
  IInclude,
  IInterpolation,
  IList,
  ILocal,
  IMacro,
  IMacroCall,
  IProgram,
  IRecover,
  IText,
  NodeNames,
} from '../nodes/Types'

import { IParams } from '../Types' // TODO remove this

export function cAssign (params : IParams, start : number, end : number) : IAssign {
  return { type : NodeNames.Assign, params, start, end }
}

export function cGlobal (params : IParams, start : number, end : number) : IGlobal {
  return { type : NodeNames.Global, params, start, end }
}

export function cCondition (params : IParams, start : number, end : number) : ICondition {
  return { type : NodeNames.Condition, params, consequent: [], start, end }
}

export function cElse (start : number, end : number) : IElse {
  return { type : NodeNames.Else, body : [], start, end }
}

export function cList (params : IParams, start : number, end : number) : IList {
  return { type : NodeNames.List, params, body : [], start, end }
}

export function cMacro (params : IParams, start : number, end : number) : IMacro {
  return { type : NodeNames.Macro, params, body : [], start, end }
}

export function cProgram (start : number, end : number) : IProgram {
  return { type : NodeNames.Program, body : [], start, end }
}

export function cMacroCall (params : IParams, name : string, start : number, end : number) : IMacroCall {
  return { type : NodeNames.MacroCall, name, params, body : [], start, end }
}

export function cText (text : string, start : number, end : number) : IText {
  return { type : NodeNames.Text, text, start, end }
}

export function cInclude (params : IParams, start : number, end : number) : IInclude {
  return { type : NodeNames.Include, params, start, end }
}

export function cInterpolation (params : IParams, start : number, end : number) : IInterpolation {
  return { type : NodeNames.Interpolation, params, start, end }
}

export function cLocal (params : IParams, start : number, end : number) : ILocal {
  return { type : NodeNames.Local, params, start, end }
}

export function cRecover (start : number, end : number) : IRecover {
  return { type : NodeNames.Recover, body : [], start, end }
}

export function cAttempt (start : number, end : number) : IAttempt {
  return { type : NodeNames.Attempt, body : [], start, end }
}
