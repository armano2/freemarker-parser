import { AllNodeTypes } from '../nodes/Types'
import ParserError from './ParserError'

export default class NodeError extends ParserError {
  public node : AllNodeTypes

  constructor (m : string, node : AllNodeTypes) {
    m = `${node.type}(${node.start}-${node.end}) - ${m}`
    super(m)
    this.node = node
  }
}
