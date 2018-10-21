import NodeNames from '../../enum/NodeNames'
import { paramParser } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class IInclude extends AbstractNode {
  public params? : IExpression

  constructor (token : IToken) {
    super(NodeNames.Include, token)
    this.params = paramParser(token.start, token.end, token.params)
  }
}
