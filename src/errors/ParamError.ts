export default class ParamError extends SyntaxError {
  public start : number
  public description : string

  constructor (message : string, start : number) {
    super(`${message} at character ${start}`)
    this.description = message
    this.start = start

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParamError.prototype)
  }
}
