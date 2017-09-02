import ParserError from '../errors/ParserError'
import { AllNodeTypes, NodeNames } from '../nodes/Types'
import { ENodeType } from '../Symbols'
import { directives, IToken } from '../tokens/Types'

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

function addToNode (parent : AllNodeTypes, child : AllNodeTypes) : AllNodeTypes {
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
  return child
}

export function tokenToNodeType (token : IToken) : NodeNames {
  switch (token.type) {
    case ENodeType.Directive:
      if (token.text in directives) {
        return directives[token.text]
      }
      throw new ParserError(`Directive \`${token.text}\` is not supported`)
    case ENodeType.Interpolation:
      return NodeNames.Interpolation
    case ENodeType.Text:
      return NodeNames.Text
    case ENodeType.Macro:
      return NodeNames.MacroCall
    case ENodeType.Program:
      return NodeNames.Program
  }
  throw new ParserError(`Unknow token \`${token.type}\` - \`${token.text}\``)
}

export function addNodeChild (parent : AllNodeTypes, token : IToken) : AllNodeTypes {
  const tokenType = tokenToNodeType(token)
  // console.log(`addNodeChild(${parent.type}, ${tokenType})`)
  switch (tokenType) {
    case NodeNames.Else:
      if (parent.type === NodeNames.Condition) {
        return parent.alternate = cElse(token.start, token.end)
      } else if (parent.type === NodeNames.List) {
        return parent.fallback = cElse(token.start, token.end)
      }
      break
    case NodeNames.ConditionElse:
      if (parent.type === NodeNames.Condition) {
        return parent.alternate = cCondition(token.params, token.start, token.end)
      }
      break
    case NodeNames.Recover:
      if (parent.type === NodeNames.Attempt) {
        return parent.fallback = cRecover(token.start, token.end)
      }
      break
    case NodeNames.Attempt:
      return addToNode(parent, cAttempt(token.start, token.end))
    case NodeNames.Condition:
      return addToNode(parent, cCondition(token.params, token.start, token.end))
    case NodeNames.List:
      return addToNode(parent, cList(token.params, token.start, token.end))
    case NodeNames.Global:
      return addToNode(parent, cGlobal(token.params, token.start, token.end))
    case NodeNames.Macro:
      return addToNode(parent, cMacro(token.params, token.start, token.end))
    case NodeNames.Assign:
      return addToNode(parent, cAssign(token.params, token.start, token.end))
    case NodeNames.Include:
      return addToNode(parent, cInclude(token.params, token.start, token.end))
    case NodeNames.Local:
      return addToNode(parent, cLocal(token.params, token.start, token.end))
    case NodeNames.Interpolation:
      return addToNode(parent, cInterpolation(token.params, token.start, token.end))
    case NodeNames.Text:
      return addToNode(parent, cText(token.text, token.start, token.end))
    case NodeNames.MacroCall:
      return addToNode(parent, cMacroCall(token.params, token.text, token.start, token.end))
    case NodeNames.Program:
      // this should nevet happen
  }
  throw new ParserError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`)
}

export enum EClosingType {
  No,
  Yes,
  Partial,
  Ignore,
}

export function isClosing (type : NodeNames, parentType : NodeNames, isClose : boolean) : EClosingType {
  switch (type) {
    case NodeNames.Program:
    case NodeNames.List:
    case NodeNames.Attempt:
    case NodeNames.Macro:
      return (type === parentType && isClose) ? EClosingType.Yes : EClosingType.No
    case NodeNames.Condition:
      return ((type === parentType || NodeNames.Else === parentType) && isClose) ? EClosingType.Yes : EClosingType.No
    case NodeNames.ConditionElse:
      return NodeNames.Condition === parentType ? EClosingType.Partial : EClosingType.No
    case NodeNames.Else:
      return (NodeNames.Condition === parentType || NodeNames.List === parentType) ? EClosingType.Partial : EClosingType.No
    case NodeNames.Recover:
      return (NodeNames.Attempt === parentType) ? EClosingType.Partial : EClosingType.No
    case NodeNames.MacroCall:
      return EClosingType.Ignore // TODO: conditional
    case NodeNames.Assign:
    case NodeNames.Global:
    case NodeNames.Local:
      return EClosingType.Ignore // TODO: conditional based on params
    case NodeNames.Include:
    case NodeNames.Text:
    case NodeNames.Interpolation:
      return EClosingType.Ignore
  }

  throw new ParserError(`isSelfClosing(${type}) failed`)
}
