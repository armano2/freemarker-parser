import { NodeConfig } from '../NodeConfig'
import ParserError from '../ParserError'
import { ENodeType, EType } from '../Types'
import { BaseNode } from './BaseNode'

export default class Directive extends BaseNode {
  public name : EType
  public params : string[]

  constructor (name : EType, params : string[], start : number, end : number) {
    super(ENodeType.Directive, start, end, true)
    this.name = name
    this.params = params
    this.isSelfClosing = this.getConfig(name)
  }

  private getConfig (type : EType) : boolean {
    const cfg = NodeConfig[type]
    if (!cfg) {
      throw new ParserError(`Invalid Token`) // TODO: add more info like location
    }
    return cfg.isSelfClosing
  }
}
