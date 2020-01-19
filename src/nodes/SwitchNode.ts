import { NodeTypes } from '../enum/NodeTypes';
import { Expression } from '../interface/Params';
import { Token } from '../interface/Tokens';
import { paramParser } from '../utils/Params';
import AbstractNode from './abstract/AbstractNode';
import SwitchCaseNode from './SwitchCaseNode';
import SwitchDefaultNode from './SwitchDefaultNode';

export type NodeSwitchGroup = SwitchCaseNode | SwitchDefaultNode;

export default class SwitchNode extends AbstractNode {
  public params?: Expression;
  public cases: NodeSwitchGroup[];

  get hasBody(): boolean {
    return true;
  }

  constructor(token: Token) {
    super(NodeTypes.Switch, token);
    this.params = paramParser(token);
    this.cases = [];
  }

  public addToNode(child: AbstractNode): void {
    if (child instanceof SwitchCaseNode || child instanceof SwitchDefaultNode) {
      this.cases.push(child);
    } else if (this.cases.length === 0) {
      if (child.type === NodeTypes.Text) {
        // TODO: accept only whitespaces
        return;
      }
    } else {
      this.cases[this.cases.length - 1].consequent.push(child);
      return;
    }
    super.addToNode(child);
  }
}
