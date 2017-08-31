import ParserError from './errors/ParserError'
import Directive from './nodes/Directive'
import IfCondtionDirective from './nodes/directives/IfCondtion'
import Include from './nodes/directives/Include'
import List from './nodes/directives/List'
import UnknownDirective from './nodes/directives/UnknownDirective'
import Interpolation from './nodes/Interpolation'
import Macro from './nodes/Macro'
import Text from './nodes/Text'
import { ENodeType, EType } from './Types'

import { BaseNode } from './nodes/BaseNode'
import { Token } from './tokens/Token'

function newDirective (token : Token) : Directive {
  switch (token.type) {
    case EType.if:
    case EType.elseif:
      return new IfCondtionDirective(token.type, token.params, token.startPos, token.endPos)
    case EType.list:
      return new List(token.type, token.params, token.startPos, token.endPos)
    case EType.include:
      return new Include(token.type, token.params, token.startPos, token.endPos)
    // TODO: add more types
  }

  return new UnknownDirective(token.type, token.params, token.startPos, token.endPos)
}

function newNode (token : Token) : BaseNode {
  switch (token.nodeType) {
    case ENodeType.Directive:
      return newDirective(token)
    case ENodeType.Macro:
      return new Macro(token.tag, token.params, token.startPos, token.endPos)
    case ENodeType.Interpolation:
      return new Interpolation(token.startPos, token.endPos, token.params)
    case ENodeType.Text:
      return new Text(token.text, token.startPos, token.endPos)
  }
  throw new ParserError('Unknown symbol')
}

export function createNode (token : Token) : BaseNode {
  const node : BaseNode = newNode(token)
  if (node.$config.disallowParams && token.params.length > 0) {
    throw new ParserError(`Params are not allowed in \`${node.$eType}\``)
  }

  return node
}
