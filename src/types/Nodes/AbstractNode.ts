import NodeNames from '../../enum/NodeNames'
import NodeError from '../../errors/NodeError'
import { ILoc } from '../Tokens'

export default abstract class AbstractNode implements ILoc {
  public type : NodeNames
  public start : number
  public end : number

  get hasBody () : boolean {
    return false
  }

  constructor (type : NodeNames, token : ILoc) {
    this.type = type
    this.start = token.start
    this.end = token.end
  }

  public addToNode (child : AbstractNode) {
    throw new NodeError(`Node ${this.type} can't contain ${child.type}`, child)
  }
}
