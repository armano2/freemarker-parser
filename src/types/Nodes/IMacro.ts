import NodeNames from '../../enum/NodeNames'
import { paramParser } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractBodyNode from './AbstractBodyNode'

export default class IMacro extends AbstractBodyNode {
  public params? : IExpression

  constructor (token : IToken) {
    super(NodeNames.Macro, token)
    this.params = paramParser(token.start, token.end, token.params)
    this.body = []
  }
}
