import { ILoc } from '../types/Tokens'

export default class NodeError extends Error implements ILoc {
  public start : number
  public end : number

  constructor (message : string, el : ILoc) {
    super(message)
    this.start = el.start
    this.end = el.end
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NodeError.prototype)
  }
}
