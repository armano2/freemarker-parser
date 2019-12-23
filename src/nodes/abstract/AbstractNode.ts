import NodeNames from '../../enum/NodeNames';
import ParseError from '../../errors/ParseError';
import { ILoc } from '../../interface/Tokens';

export default abstract class AbstractNode implements ILoc {
  public type: NodeNames;
  public start: number;
  public end: number;

  get hasBody(): boolean {
    return false;
  }

  protected constructor(type: NodeNames, token: ILoc) {
    this.type = type;
    this.start = token.start;
    this.end = token.end;
  }

  public addToNode(child: AbstractNode): void {
    throw new ParseError(
      `Node ${this.type} can't contain ${child.type}`,
      child,
    );
  }
}
