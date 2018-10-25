import * as assert from 'assert'
import { ENodeType } from '../../src/Symbols'
import { IToken } from '../../src/types/Tokens'

export default class Tester {
  public static instance (tokens : IToken[]) {
    return new Tester(tokens)
  }

  private readonly tokens : IToken[]
  private index : number = 0

  private get token () {
    return this.tokens[this.index]
  }

  constructor (tokens : IToken[]) {
    this.tokens = tokens
  }

  public hasCount (value : number) {
    assert.strictEqual(this.tokens.length, value, 'Invalid amount of elements')
    return this
  }

  public nextToken () {
    ++this.index
    return this
  }

  public get (index : number) {
    this.index = index
    return this
  }

  public isType (tokenType : ENodeType) {
    assert.strictEqual(this.token.type, tokenType, `[${this.index}] Is not a ${tokenType}`)
    return this
  }

  public hasNoParams () {
    return this.hasParams()
  }

  public hasParams (params? : string) {
    assert.strictEqual(this.token.params, params, `[${this.index}] Found ${this.token.params || 'no params'} but expected ${params || 'no params'}`)
    return this
  }

  public isCloseTag (isClose : boolean) {
    assert.strictEqual(this.token.isClose, isClose, `[${this.index}] should isClose = ${isClose}`)
    return this
  }

  public hasText (text : string) {
    assert.strictEqual(this.token.text, text, `[${this.index}] text do not match`)
    return this
  }
}
