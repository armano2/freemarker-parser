import NodeNames from '../enum/NodeNames'
import { IToken } from '../interface/Tokens'
import AbstractNode from './abstract/AbstractNode'

export default class AttemptNode extends AbstractNode {
  public body : AbstractNode[] = []
  public fallback? : AbstractNode[]

  get hasBody () : boolean {
    return true
  }

  constructor (token : IToken) {
    super(NodeNames.Attempt, token)
  }

  public addToNode (child : AbstractNode) {
    this.fallback ? this.fallback.push(child) : this.body.push(child)
  }
}
