import { NodeTypes } from '../../enum/NodeTypes';
import ParseError from '../../errors/ParseError';
import { Location, Token } from '../../interface/Tokens';

export default abstract class AbstractNode implements Location {
  public type: NodeTypes;
  public start: number;
  public end: number;

  get hasBody(): boolean {
    return false;
  }

  protected constructor(type: NodeTypes, token: Location) {
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

  protected noParams(token: Token): void {
    if (token.params) {
      throw new ParseError(`Unexpected parameter in ${this.type}`, token);
    }
  }
}
