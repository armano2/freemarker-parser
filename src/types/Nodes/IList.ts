import NodeNames from '../../enum/NodeNames'
import { paramParser } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'

export default class IList extends AbstractNode {
  public params? : IExpression
  public body : AbstractNode[]
  public fallback? : AbstractNode[]

  get hasBody () : boolean {
    return true
  }

  constructor (token : IToken) {
    super(NodeNames.List, token)
    this.params = paramParser(token.start, token.end, token.params)
    this.body = []
  }

  public addToNode (child : AbstractNode) {
    this.fallback ? this.fallback.push(child) : this.body.push(child)
  }
}
