import { ENodeType } from '../Types'
import { BaseNode } from './BaseNode'

export default class Text extends BaseNode {
  public text : string = ''
  constructor (text : string = '', start : number, end : number) {
    super(ENodeType.Text, start, end, true)
    this.text = text
  }
}
