import { BaseNode } from '../nodes/BaseNode'
import ParserError from './ParserError'

export default class NodeError extends ParserError {
  public node : BaseNode

  constructor (m : string, node : BaseNode) {
    m = `${m}\n\t${node.$nodeType}(${node.start}-${node.end})`
    super(m)
    this.node = node
  }
}
