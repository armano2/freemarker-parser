import NodeNames from '../enum/NodeNames'
import { IExpression } from '../interface/Params'
import { IToken } from '../interface/Tokens'
import { paramParser } from '../utils/Params'
import AbstractNode from './abstract/AbstractNode'
import SwitchCaseNode from './SwitchCaseNode'
import SwitchDefaultNode from './SwitchDefaultNode'

export type NodeSwitchGroup = SwitchCaseNode | SwitchDefaultNode

export default class SwitchNode extends AbstractNode {
  public params? : IExpression
  public cases : NodeSwitchGroup[]

  get hasBody () : boolean {
    return true
  }

  constructor (token : IToken) {
    super(NodeNames.Switch, token)
    this.params = paramParser(token)
    this.cases = []
  }

  public addToNode (child : AbstractNode) {
    if (child instanceof SwitchCaseNode || child instanceof SwitchDefaultNode) {
      this.cases.push(child)
    } else if (this.cases.length === 0) {
      if (child.type === NodeNames.Text) { // TODO: accept only whitespaces
        return
      }
    } else {
      this.cases[this.cases.length - 1].consequent.push(child)
      return
    }
    super.addToNode(child)
  }
}
