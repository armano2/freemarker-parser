import ParserError from '../errors/ParserError'
import { AllNodeTypes, NodeNames } from '../nodes/Types'
import { Token } from '../tokens/Token'
import { EType, IParams } from '../Types'

import {
  cAssign,
  cAttempt,
  cCondition,
  cElse,
  cGlobal,
  cInclude,
  cInterpolation,
  cList,
  cLocal,
  cMacro,
  cMacroCall,
  cRecover,
  cText,
} from './Node'

function addToChild (parent : AllNodeTypes, child : AllNodeTypes) : AllNodeTypes {
  switch (parent.type) {
    case NodeNames.Condition:
      parent.consequent.push(child)
      break
    case NodeNames.List:
    case NodeNames.Else:
    case NodeNames.Macro:
    case NodeNames.Program:
    case NodeNames.Attempt:
    case NodeNames.Recover:
      parent.body.push(child)
      break
    case NodeNames.MacroCall:
    case NodeNames.Assign:
    case NodeNames.Global:
    case NodeNames.Local:
      // TODO: only when multiline
      throw new ParserError(`addToChild(${parent.type}, ${child.type}) failed`)
    case NodeNames.Interpolation:
    case NodeNames.Include:
    case NodeNames.Text:
    default:
      throw new ParserError(`addToChild(${parent.type}, ${child.type}) failed`)
  }
  return parent
}

export function addNodeChild (parent : AllNodeTypes, token : Token) : AllNodeTypes {
  switch (token.type) {
    case EType.else:
      if (parent.type === NodeNames.Condition) {
        return parent.alternate = cElse(token.start, token.end)
      } else if (parent.type === NodeNames.List) {
        return parent.fallback = cElse(token.start, token.end)
      }
      break
    case EType.elseif:
      if (parent.type === NodeNames.Condition) {
        return parent.alternate = cCondition(token.params, token.start, token.end)
      }
      break
    case EType.recover:
      if (parent.type === NodeNames.Attempt) {
        return parent.fallback = cRecover(token.start, token.end)
      }
      break
    case EType.attempt:
      return addToChild(parent, cAttempt(token.start, token.end))
    case EType.if:
      return addToChild(parent, cCondition(token.params, token.start, token.end))
    case EType.list:
      return addToChild(parent, cList(token.params, token.start, token.end))
    case EType.global:
      return addToChild(parent, cGlobal(token.params, token.start, token.end))
    case EType.macro:
      return addToChild(parent, cMacro(token.params, token.start, token.end))
    case EType.assign:
      return addToChild(parent, cAssign(token.params, token.start, token.end))
    case EType.MacroCall:
      return addToChild(parent, cMacroCall(token.params, token.tag, token.start, token.end))
    case EType.Text:
      return addToChild(parent, cText(token.text, token.start, token.end))
    case EType.include:
      return addToChild(parent, cInclude(token.params, token.start, token.end))
    case EType.Interpolation:
      return addToChild(parent, cInterpolation(token.params, token.start, token.end))
    case EType.local:
      return addToChild(parent, cLocal(token.params, token.start, token.end))
  }

  throw new ParserError(`Invalid usage of ${token.type}`)
}

export function isSelfClosing (node : AllNodeTypes) : boolean {
  switch (node.type) {
    case NodeNames.Program:
    case NodeNames.Condition:
    case NodeNames.List:
    case NodeNames.Attempt:
    case NodeNames.Macro:
      return false
    case NodeNames.MacroCall:
      return true // TODO: conditional
    case NodeNames.Assign:
    case NodeNames.Global:
    case NodeNames.Local:
      return true // TODO: conditional based on params
    case NodeNames.Else:
    case NodeNames.Include:
    case NodeNames.Text:
    case NodeNames.Interpolation:
    case NodeNames.Recover:
      return true
  }

  throw new ParserError(`isSelfClosing(${name}) failed`)
}
