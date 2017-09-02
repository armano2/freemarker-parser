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
  return { type : NodeNames.Assign, start, end, params }
}

export function cGlobal (params : IParams, start : number, end : number) : IGlobal {
  return { type : NodeNames.Global, start, end, params }
}

export function cCondition (params : IParams, start : number, end : number) : ICondition {
  return { type : NodeNames.Condition, start, end, params, consequent: [] }
}

export function cElse (start : number, end : number) : IElse {
  return { type : NodeNames.Else, start, end, body : [] }
}

export function cList (params : IParams, start : number, end : number) : IList {
  return { type : NodeNames.List, start, end, params, body : [] }
}

export function cMacro (params : IParams, start : number, end : number) : IMacro {
  return { type : NodeNames.Macro, start, end, params, body : [] }
}

export function cProgram (start : number, end : number) : IProgram {
  return { type : NodeNames.Program, start, end, body : [] }
}

export function cMacroCall (params : IParams, name : string, start : number, end : number) : IMacroCall {
  return { type : NodeNames.MacroCall, start, end, name, params, body : [] }
}

export function cText (text : string, start : number, end : number) : IText {
  return { type : NodeNames.Text, start, end, text }
}

export function cInclude (params : IParams, start : number, end : number) : IInclude {
  return { type : NodeNames.Include, start, end, params }
}

export function cInterpolation (params : IParams, start : number, end : number) : IInterpolation {
  return { type : NodeNames.Interpolation, start, end, params }
}

export function cLocal (params : IParams, start : number, end : number) : ILocal {
  return { type : NodeNames.Local, start, end, params }
}

export function cRecover (start : number, end : number) : IRecover {
  return { type : NodeNames.Recover, start, end, body : [] }
}

export function cAttempt (start : number, end : number) : IAttempt {
  return { type : NodeNames.Attempt, start, end, body : [] }
}
