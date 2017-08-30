import { ENodeType } from '../Types'
import { BaseNode } from './BaseNode'

export default class ProgramNode extends BaseNode {
  constructor (start : number, end : number) {
    super(ENodeType.Program, start, end)
  }
}
