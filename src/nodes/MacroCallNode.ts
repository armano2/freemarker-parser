import NodeNames from '../enum/NodeNames'
import { IExpression } from '../interface/Params'
import { IToken } from '../interface/Tokens'
import { paramParser } from '../utils/Params'
import AbstractBodyNode from './abstract/AbstractBodyNode'
import AbstractNode from './abstract/AbstractNode'

export default class MacroCallNode extends AbstractBodyNode {
  public params? : IExpression
  public name : string
  public body? : AbstractNode[]

  constructor (token : IToken) {
    super(NodeNames.MacroCall, token)
    this.name = token.text
    this.params = paramParser(token)
    if (token.endTag !== '/>') {
      this.body = []
    }
  }
}
