import NodeNames from '../enum/NodeNames'
import { IExpression } from '../interface/Params'
import { IToken } from '../interface/Tokens'
import { paramParser } from '../utils/Params'
import AbstractNode from './abstract/AbstractNode'

export default class ImportNode extends AbstractNode {
  public params? : IExpression

  constructor (token : IToken) {
    super(NodeNames.Import, token)
    this.params = paramParser(token.start, token.end, token.params)
  }
}
