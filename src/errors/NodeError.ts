import { AllNodeTypes } from '../nodes/Types'
import { IToken } from '../tokens/Types'

export default class NodeError extends Error {
  public nodeType : string
  public start : number
  public end : number

  constructor (m : string, el : AllNodeTypes | IToken | undefined) {
    super(m)
    if (el) {
      this.nodeType = el.type
      this.start = el.start
      this.end = el.end
    }
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NodeError.prototype)
  }
}
