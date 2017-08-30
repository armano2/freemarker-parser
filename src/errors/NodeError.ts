import { BaseNode } from '../nodes/BaseNode'
import ParserError from './ParserError'

export default class NodeError extends ParserError {
  constructor (m : string, node : BaseNode) {
    m = `${m}: ${node.type} (${node.start}-${node.end})`
    super(m)
  }
}
