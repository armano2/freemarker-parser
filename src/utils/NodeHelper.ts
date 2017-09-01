import ParserError from '../errors/ParserError'
import Directive from '../nodes/Directive'
import IfCondtionDirective from '../nodes/directives/IfCondtion'
import Include from '../nodes/directives/Include'
import List from '../nodes/directives/List'
import UnknownDirective from '../nodes/directives/UnknownDirective'
import Interpolation from '../nodes/Interpolation'
import Macro from '../nodes/Macro'
import Text from '../nodes/Text'
import { ENodeType, EType, IParams } from '../Types'

import { BaseNode } from '../nodes/BaseNode'
import { ParamsParser } from '../params/ParamsParser'
import { Token } from '../tokens/Token'

function newDirective (token : Token) : Directive {
  switch (token.type) {
    case EType.if:
    case EType.elseif:
      return new IfCondtionDirective(token.type, parseParams(token), token.start, token.end)
    case EType.list:
      return new List(token.type, parseParams(token), token.start, token.end)
    case EType.include:
      return new Include(token.type, parseParams(token), token.start, token.end)
    // TODO: add more types
  }

  return new UnknownDirective(token.type, parseParams(token), token.start, token.end)
}

function parseParams (token : Token) : IParams {
  const parser = new ParamsParser()
  const params : IParams = []
  for (const param of token.params) {
    params.push(parser.parse(param))
  }
  return params
}

function newNode (token : Token) : BaseNode {
  switch (token.nodeType) {
    case ENodeType.Directive:
      return newDirective(token)
    case ENodeType.Macro:
      return new Macro(token.tag, parseParams(token), token.start, token.end)
    case ENodeType.Interpolation:
      return new Interpolation(token.start, token.end, parseParams(token))
    case ENodeType.Text:
      return new Text(token.text, token.start, token.end)
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
