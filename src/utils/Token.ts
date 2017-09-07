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
  cFunction,
  cGlobal,
  cInclude,
  cInterpolation,
  cList,
  cLocal,
  cMacro,
  cMacroCall,
  cReturn,
  cSwitch,
  cSwitchCase,
  cSwitchDefault,
  cText,
} from './Node'

function addToNode (parent : AllNodeTypes, child : AllNodeTypes) : void {
  switch (parent.type) {
    case NodeNames.Condition:
      parent.alternate ? parent.alternate.push(child) : parent.consequent.push(child)
      return
    case NodeNames.List:
      parent.fallback ? parent.fallback.push(child) : parent.body.push(child)
      return
    case NodeNames.Switch:
      if (child.type === NodeNames.SwitchCase || child.type === NodeNames.SwitchDefault) {
        parent.cases.push(child)
      } else if (parent.cases.length === 0) {
        if (child.type === NodeNames.Text) {
          return
        }
      } else {
        parent.cases[parent.cases.length - 1].consequent.push(child)
        return
      }
      break
    case NodeNames.Macro:
    case NodeNames.Program:
    case NodeNames.Function:
      parent.body.push(child)
      return
    case NodeNames.Attempt:
      parent.fallback ? parent.fallback.push(child) : parent.body.push(child)
      return
    case NodeNames.Assign:
    case NodeNames.Global:
    case NodeNames.Local:
    case NodeNames.MacroCall:
      if (parent.body) {
        parent.body.push(child)
        return
      }
      break
    case NodeNames.Interpolation:
    case NodeNames.Include:
    case NodeNames.Text:
    case NodeNames.Return:
    case NodeNames.Comment:
    case NodeNames.SwitchDefault:
    case NodeNames.SwitchCase:
    case NodeNames.Break:
  }
  throw new NodeError(`addToNode(${parent.type}, ${child.type}) failed`, child)
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
  let node : AllNodeTypes | null = null
  switch (tokenType) {
    case NodeNames.Else:
      if (parent.type === NodeNames.Condition && !parent.alternate) {
        parent.alternate = []
        return parent
      } else if (parent.type === NodeNames.List && !parent.fallback) {
        parent.fallback = []
        return parent
      }
      break
    case NodeNames.ConditionElse:
      if (parent.type === NodeNames.Condition && !parent.alternate) {
        node = cCondition(token.start, token.end, token.params)
        parent.alternate = []
        parent.alternate.push(node)
        return node
      }
      break
    case NodeNames.Recover:
      if (parent.type === NodeNames.Attempt) {
        if (!parent.fallback) {
          parent.fallback = []
          return parent
        }
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
    case NodeNames.Global:
      node = cGlobal(token.start, token.end, token.params)
      break
    case NodeNames.Local:
      node = cLocal(token.start, token.end, token.params)
      break
    case NodeNames.Assign:
      node = cAssign(token.start, token.end, token.params)
      break
    case NodeNames.Function:
      node = cFunction(token.start, token.end, token.params)
      break
    case NodeNames.Return:
      node = cReturn(token.start, token.end, token.params)
      break
    case NodeNames.Attempt:
      node = cAttempt(token.start, token.end)
      break
    case NodeNames.Condition:
      node = cCondition(token.start, token.end, token.params)
      break
    case NodeNames.List:
      node = cList(token.start, token.end, token.params)
      break
    case NodeNames.Macro:
      node = cMacro(token.start, token.end, token.params)
      break
    case NodeNames.Include:
      node = cInclude(token.start, token.end, token.params)
      break
    case NodeNames.Interpolation:
      node = cInterpolation(token.start, token.end, token.params)
      break
    case NodeNames.Text:
      node = cText(token.text, token.start, token.end)
      break
    case NodeNames.MacroCall:
      node = cMacroCall(token.text, token.start, token.end, token.endTag, token.params)
      break
    case NodeNames.Comment:
      node = cComment(token.text, token.start, token.end)
      break
    case NodeNames.Switch:
      node = cSwitch(token.start, token.end, token.params)
      break
    case NodeNames.Break:
      node = cBreak(token.start, token.end)
      break
  }

  if (node) {
    addToNode(parent, node)
    return node
  }
  throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token)
}

export function isPartial (type : NodeNames, parentType : NodeNames) : boolean {
  switch (type) {
    case NodeNames.ConditionElse:
      return NodeNames.Condition === parentType
    case NodeNames.Else:
      return (NodeNames.Condition === parentType || NodeNames.List === parentType)
    case NodeNames.Recover:
      return (NodeNames.Attempt === parentType)
  }

  return false
}

export function canAddChildren (node : AllNodeTypes) : boolean {
  switch (node.type) {
    case NodeNames.Condition:
    case NodeNames.List:
    case NodeNames.Attempt:
    case NodeNames.Function:
    case NodeNames.Switch:
    case NodeNames.Macro:
    case NodeNames.Program:
      return true
    case NodeNames.Global:
    case NodeNames.Local:
    case NodeNames.Assign:
    case NodeNames.MacroCall:
      return Boolean(node.body)
  }
  return false
}
