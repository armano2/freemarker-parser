import NodeNames from '../../enum/NodeNames'
import { paramParser } from '../../utils/Params'
import { IExpression } from '../Params'
import { IToken } from '../Tokens'
import AbstractNode from './AbstractNode'
import ISwitchCase from './ISwitchCase'
import ISwitchDefault from './ISwitchDefault'

export type NodeSwitchGroup = ISwitchCase | ISwitchDefault

export default class ISwitch extends AbstractNode {
  public params? : IExpression
  public cases : NodeSwitchGroup[]

  get hasBody () : boolean {
    return true
  }

  constructor (token : IToken) {
    super(NodeNames.Switch, token)
    this.params = paramParser(token.start, token.end, token.params)
    this.cases = []
  }

  public addToNode (child : AbstractNode) {
    if (child instanceof ISwitchCase || child instanceof ISwitchDefault) {
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
