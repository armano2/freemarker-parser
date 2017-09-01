import { ENodeType, EType, IParams } from '../Types'
import { BaseNode } from './BaseNode'

// TODO: rename this
export default class Macro extends BaseNode {
  public name : string
  public params : IParams

  constructor (name : string, params : IParams, start : number, end : number) {
    super(ENodeType.Macro, start, end, EType.MacroCall)
    this.name = name
    this.params = params
  }
}
