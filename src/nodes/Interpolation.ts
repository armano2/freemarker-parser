import { ENodeType, EType } from '../Types'
import { BaseNode } from './BaseNode'

export default class Interpolation extends BaseNode {
  public params : string[]

  constructor (start : number, end : number, params : string[]) {
    super(ENodeType.Interpolation, start, end, EType.Interpolation)
    this.params = params
  }
}
