import { ILoc } from '../types/Tokens'

export default class NodeError extends Error {
  public start : number
  public end : number

  constructor (m : string, el : ILoc) {
    super(m)
    this.start = el.start
    this.end = el.end
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NodeError.prototype)
  }
}
