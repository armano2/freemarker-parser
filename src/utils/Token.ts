import NodeNames from '../enum/NodeNames'
import NodeError from '../errors/NodeError'
import { ENodeType } from '../Symbols'
import { AllNodeTypes } from '../types/Node'
import { IToken } from '../types/Tokens'
import directives from './Directives'
import Nodes from './Nodes'

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
    case NodeNames.Compress:
    case NodeNames.MacroCall:
      if (parent.body) {
        parent.body.push(child)
        return
      }
      break
    case NodeNames.Interpolation:
    case NodeNames.Include:
    case NodeNames.Import:
    case NodeNames.Text:
    case NodeNames.Return:
    case NodeNames.Comment:
    case NodeNames.SwitchDefault:
    case NodeNames.SwitchCase:
    case NodeNames.Break:
    case NodeNames.Stop:
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
  if (tokenType in Nodes) {
    const node : AllNodeTypes = Nodes[tokenType](token, parent)
    if (parent !== node) {
      addToNode(parent, node)
    }
    return node
  }

  throw new NodeError(`Unknown '${tokenType}'`, token)
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
    case NodeNames.Compress:
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
