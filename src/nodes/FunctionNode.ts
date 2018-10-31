import NodeNames from '../enum/NodeNames'
import { IExpression } from '../interface/Params'
import { IToken } from '../interface/Tokens'
import { paramParser } from '../utils/Params'
import AbstractBodyNode from './abstract/AbstractBodyNode'

export default class FunctionNode extends AbstractBodyNode {
  public params? : IExpression

  constructor (token : IToken) {
    super(NodeNames.Function, token)
    this.params = paramParser(token.start, token.end, token.params)
    this.body = []
  }
}
