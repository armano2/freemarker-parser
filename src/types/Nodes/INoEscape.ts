import NodeNames from '../../enum/NodeNames'
import ParseError from '../../errors/ParseError'
import { IToken } from '../Tokens'
import AbstractBodyNode from './AbstractBodyNode'

export default class INoEscape extends AbstractBodyNode {
  constructor (token : IToken) {
    super(NodeNames.NoEscape, token)
    this.body = []
    if (token.params) {
      throw new ParseError('Unexpected params', token)
    }
  }
}
