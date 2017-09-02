export default class ParamError extends SyntaxError {
  public index : number
  public description : string

  constructor (message : string, index : number) {
    super(`${message} at character ${index}`)
    this.description = message
    this.index = index

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParamError.prototype)
  }
}
