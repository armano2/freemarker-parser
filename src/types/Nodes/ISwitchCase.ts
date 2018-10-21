import NodeNames from '../../enum/NodeNames'
import { paramParser } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class ISwitchCase extends AbstractNode {
  public params? : IExpression
  public consequent : AbstractNode[]

  constructor (token : IToken) {
    super(NodeNames.SwitchCase, token)
    this.params = paramParser(token.start, token.end, token.params)
    this.consequent = []
  }
}
