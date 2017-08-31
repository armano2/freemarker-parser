import { ENodeType, EType } from '../Types'
import { BaseNode } from './BaseNode'

// TODO: rename this
export default class Macro extends BaseNode {
  public name : string
  public params : string[]

  constructor (name : string, params : string[], start : number, end : number) {
    super(ENodeType.Macro, start, end, EType.MacroCall)
    this.name = name
    this.params = params
  }
}
