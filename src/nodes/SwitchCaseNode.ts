import NodeNames from '../enum/NodeNames'
import { IExpression } from '../interface/Params'
import { IToken } from '../interface/Tokens'
import { paramParser } from '../utils/Params'
import AbstractNode from './abstract/AbstractNode'

export default class SwitchCaseNode extends AbstractNode {
  public params? : IExpression
  public consequent : AbstractNode[]

  constructor (token : IToken) {
    super(NodeNames.SwitchCase, token)
    this.params = paramParser(token)
    this.consequent = []
  }
}
