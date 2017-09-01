import { ENodeType, EType, IParams } from '../Types'
import { BaseNode } from './BaseNode'

export default class Interpolation extends BaseNode {
  public params : IParams

  constructor (start : number, end : number, params : IParams) {
    super(ENodeType.Interpolation, start, end, EType.Interpolation)
    this.params = params
  }
}
