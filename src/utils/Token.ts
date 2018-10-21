import NodeNames from '../enum/NodeNames'
import NodeError from '../errors/NodeError'
import { ENodeType } from '../Symbols'
import AbstractNode from '../types/Nodes/AbstractNode'
import { IToken } from '../types/Tokens'
import directives from './Directives'
import Nodes from './Nodes'

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

export function addNodeChild (parent : AbstractNode, token : IToken) : AbstractNode {
  const tokenType = tokenToNodeType(token)
  if (tokenType in Nodes) {
    const node : AbstractNode = Nodes[tokenType](token, parent)
    if (parent !== node) {
      parent.addToNode(node)
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
