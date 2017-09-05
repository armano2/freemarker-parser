import NodeError from '../errors/NodeError'
import { directives, NodeNames } from '../Names'
import { ENodeType } from '../Symbols'
import { AllNodeTypes } from '../types/Node'
import { IToken } from '../types/Tokens'
import {
  cAssign,
  cAttempt,
  cBreak,
  cComment,
  cCondition,
  cGlobal,
  cInclude,
  cInterpolation,
  cList,
  cLocal,
  cMacro,
  cMacroCall,
  cSwitch,
  cSwitchCase,
  cSwitchDefault,
  cText,
} from './Node'

function addToNode (parent : AllNodeTypes, child : AllNodeTypes) : AllNodeTypes {
  switch (parent.type) {
    case NodeNames.Condition:
      parent.alternate ? parent.alternate.push(child) : parent.consequent.push(child)
      break
    case NodeNames.List:
      parent.fallback ? parent.fallback.push(child) : parent.body.push(child)
      break
    case NodeNames.Switch:
      if (child.type === NodeNames.SwitchCase || child.type === NodeNames.SwitchDefault) {
        parent.cases.push(child)
      } else if (parent.cases.length === 0) {
        if (child.type !== NodeNames.Text) {
          throw new NodeError(`addToChild(${parent.type}, ${child.type}) failed`, child)
        }
      } else {
        parent.cases[parent.cases.length - 1].consequent.push(child)
      }
      break
    case NodeNames.Macro:
    case NodeNames.Program:
      parent.body.push(child)
      break
    case NodeNames.Attempt:
      parent.fallback ? parent.fallback.push(child) : parent.body.push(child)
      break
    case NodeNames.MacroCall:
    case NodeNames.Assign:
    case NodeNames.Global:
    case NodeNames.Local:
      // TODO: only when multiline
      throw new NodeError(`addToChild(${parent.type}, ${child.type}) failed`, child)
    case NodeNames.Interpolation:
    case NodeNames.Include:
    case NodeNames.Text:
    case NodeNames.Comment:
    case NodeNames.SwitchDefault:
    case NodeNames.SwitchCase:
    case NodeNames.Break:
    default:
      throw new NodeError(`addToChild(${parent.type}, ${child.type}) failed`, child)
  }
  return child
}

export function tokenToNodeType (token : IToken) : NodeNames {
  switch (token.type) {
    case ENodeType.Directive:
      if (token.text in directives) {
        return directives[token.text]
      }
      throw new NodeError(`Directive \`${token.text}\` is not supported`, token)
    case ENodeType.Interpolation:
      return NodeNames.Interpolation
    case ENodeType.Text:
      return NodeNames.Text
    case ENodeType.Macro:
      return NodeNames.MacroCall
    case ENodeType.Comment:
      return NodeNames.Comment
  }
  throw new NodeError(`Unknow token \`${token.type}\` - \`${token.text}\``, token)
}

export function addNodeChild (parent : AllNodeTypes, token : IToken) : AllNodeTypes {
  const tokenType = tokenToNodeType(token)
  // console.log(`addNodeChild(${parent.type}, ${tokenType})`)
  switch (tokenType) {
    case NodeNames.Else:
      if (parent.type === NodeNames.Condition) {
        if (parent.alternate) {
          throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token) // TODO: improve this message
        }
        parent.alternate = []
        return parent
      } else if (parent.type === NodeNames.List) {
        if (parent.fallback) {
          throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token) // TODO: improve this message
        }
        parent.fallback = []
        return parent
      }
      break
    case NodeNames.ConditionElse:
      if (parent.type === NodeNames.Condition) {
        const node = cCondition(token.start, token.end, token.params)
        if (parent.alternate) {
          throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token) // TODO: improve this message
        }
        parent.alternate = []
        parent.alternate.push(node)
        return node
      }
      break
    case NodeNames.Recover:
      if (parent.type === NodeNames.Attempt) {
        if (parent.fallback) {
          throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token) // TODO: improve this message
        }
        parent.fallback = []
        return parent
      }
      break
    case NodeNames.SwitchCase:
      if (parent.type === NodeNames.Switch) {
        parent.cases.push(cSwitchCase(token.start, token.end, token.params))
        return parent
      }
      break
    case NodeNames.SwitchDefault:
      if (parent.type === NodeNames.Switch) {
        parent.cases.push(cSwitchDefault(token.start, token.end))
        return parent
      }
      break
    case NodeNames.Attempt:
      return addToNode(parent, cAttempt(token.start, token.end))
    case NodeNames.Condition:
      return addToNode(parent, cCondition(token.start, token.end, token.params))
    case NodeNames.List:
      return addToNode(parent, cList(token.start, token.end, token.params))
    case NodeNames.Global:
      return addToNode(parent, cGlobal(token.start, token.end, token.params))
    case NodeNames.Macro:
      return addToNode(parent, cMacro(token.start, token.end, token.params))
    case NodeNames.Assign:
      return addToNode(parent, cAssign(token.start, token.end, token.params))
    case NodeNames.Include:
      return addToNode(parent, cInclude(token.start, token.end, token.params))
    case NodeNames.Local:
      return addToNode(parent, cLocal(token.start, token.end, token.params))
    case NodeNames.Interpolation:
      return addToNode(parent, cInterpolation(token.start, token.end, token.params))
    case NodeNames.Text:
      return addToNode(parent, cText(token.text, token.start, token.end))
    case NodeNames.MacroCall:
      return addToNode(parent, cMacroCall(token.text, token.start, token.end, token.params))
    case NodeNames.Comment:
      return addToNode(parent, cComment(token.text, token.start, token.end))
    case NodeNames.Switch:
      return addToNode(parent, cSwitch(token.start, token.end, token.params))
    case NodeNames.Break:
      return addToNode(parent, cBreak(token.start, token.end))
    case NodeNames.Program:
      // this should nevet happen
  }
  throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token)
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
    case NodeNames.Attempt:
    case NodeNames.Macro:
    case NodeNames.Condition:
    case NodeNames.List:
    case NodeNames.Switch:
      return (type === parentType && isClose) ? EClosingType.Yes : EClosingType.No
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
    case NodeNames.SwitchCase:
    case NodeNames.SwitchDefault:
      return EClosingType.Ignore
    case NodeNames.Include:
    case NodeNames.Text:
    case NodeNames.Interpolation:
    case NodeNames.Comment:
    case NodeNames.Break:
      return EClosingType.Ignore
  }

  throw new ReferenceError(`isClosing(${type}) failed`)
}
