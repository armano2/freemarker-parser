import NodeNames from '../enum/NodeNames'
import ParseError from '../errors/ParseError'
import { IToken } from '../interface/Tokens'
import AbstractBodyNode from './abstract/AbstractBodyNode'

export default class NoEscapeNode extends AbstractBodyNode {
  constructor (token : IToken) {
    super(NodeNames.NoEscape, token)
    this.body = []
    if (token.params) {
      throw new ParseError('Unexpected params', token)
    }
  }
}
