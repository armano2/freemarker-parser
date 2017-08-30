
export default class ParserError extends Error {
  constructor (m : string) {
    super(m)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ParserError.prototype)
  }
}
