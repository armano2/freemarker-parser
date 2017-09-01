import ParserError from './errors/ParserError'
import Directive from './nodes/Directive'
import IfCondtionDirective from './nodes/directives/IfCondtion'
import Include from './nodes/directives/Include'
import List from './nodes/directives/List'
import UnknownDirective from './nodes/directives/UnknownDirective'
import Interpolation from './nodes/Interpolation'
import Macro from './nodes/Macro'
import Text from './nodes/Text'
import { ENodeType, EType, IParams } from './Types'

import { BaseNode } from './nodes/BaseNode'
import { ParamsParser } from './params/ParamsParser'
import { Token } from './tokens/Token'

function newDirective (token : Token) : Directive {
  switch (token.type) {
    case EType.if:
    case EType.elseif:
      return new IfCondtionDirective(token.type, parseParams(token), token.startPos, token.endPos)
    case EType.list:
      return new List(token.type, parseParams(token), token.startPos, token.endPos)
    case EType.include:
      return new Include(token.type, parseParams(token), token.startPos, token.endPos)
    // TODO: add more types
  }

  return new UnknownDirective(token.type, parseParams(token), token.startPos, token.endPos)
}

function parseParams (token : Token) : IParams {
  const parser = new ParamsParser()
  const params : IParams = []
  for (const param of token.params) {
    console.log(`parseParams: \`${param}\``)
    params.push(parser.parse(param))
  }
  return params
}

function newNode (token : Token) : BaseNode {
  switch (token.nodeType) {
    case ENodeType.Directive:
      return newDirective(token)
    case ENodeType.Macro:
      return new Macro(token.tag, parseParams(token), token.startPos, token.endPos)
    case ENodeType.Interpolation:
      return new Interpolation(token.startPos, token.endPos, parseParams(token))
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
