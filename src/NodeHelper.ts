import ParserError from './errors/ParserError'
import Directive from './nodes/Directive'
import IfCondtionDirective from './nodes/directives/IfCondtion'
import UnknownDirective from './nodes/directives/UnknownDirective'
import Interpolation from './nodes/Interpolation'
import Macro from './nodes/Macro'
import Text from './nodes/Text'
import { ENodeType, EType } from './Types'

import { BaseNode } from './nodes/BaseNode'
import { Token } from './tokens/Token'

function createDirective (token : Token) : Directive {
  switch (token.type) {
    case EType.if:
    case EType.elseif:
      return new IfCondtionDirective(token.type, token.params, token.startPos, token.endPos, token.type !== EType.if)
    // TODO: add more types
  }

  return new UnknownDirective(token.type, token.params, token.startPos, token.endPos)
}

export function createNode (token : Token) : BaseNode {
  switch (token.nodeType) {
    case ENodeType.Directive:
      return createDirective(token)
    case ENodeType.Macro:
      return new Macro(token.tag, token.params, token.startPos, token.endPos)
    case ENodeType.Interpolation:
      return new Interpolation(token.startPos, token.endPos, token.params)
    case ENodeType.Text:
      return new Text(token.text, token.startPos, token.endPos)
  }
  throw new ParserError('Unknown symbol')
}
