import { ENodeType, EType } from '../Types'
import { BaseNode } from './BaseNode'

export default class Text extends BaseNode {
  public text : string = ''
  constructor (text : string = '', start : number, end : number) {
    super(ENodeType.Text, start, end, EType.Text)
    this.text = text
  }
}
