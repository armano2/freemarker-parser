import NodeNames from '../enum/NodeNames'
import { IExpression } from '../interface/Params'
import { IToken } from '../interface/Tokens'
import { paramParser } from '../utils/Params'
import AbstractNode from './abstract/AbstractNode'

export default class InterpolationNode extends AbstractNode {
  public params? : IExpression

  constructor (token : IToken) {
    super(NodeNames.Interpolation, token)
    this.params = paramParser(token)
  }
}
