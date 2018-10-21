import NodeNames from '../../enum/NodeNames'
import { paramParser } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class IReturn extends AbstractNode {
  public params? : IExpression

  constructor (token : IToken) {
    super(NodeNames.Return, token)
    this.params = paramParser(token.start, token.end, token.params)
  }
}
