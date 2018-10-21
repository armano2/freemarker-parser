import NodeNames from '../../enum/NodeNames'
import { paramParser } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractBodyNode from './AbstractBodyNode'
import AbstractNode from './AbstractNode'

export default class IMacroCall extends AbstractBodyNode {
  public params? : IExpression
  public name : string
  public body? : AbstractNode[]

  constructor (token : IToken) {
    super(NodeNames.MacroCall, token)
    this.name = token.text
    this.params = paramParser(token.start, token.end, token.params)
    if (token.endTag !== '/>') {
      this.body = []
    }
  }
}
