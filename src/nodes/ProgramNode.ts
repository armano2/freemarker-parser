import { NodeTypes } from '../enum/NodeTypes';
import ParseError from '../errors/ParseError';
import AbstractBodyNode from './abstract/AbstractBodyNode';
import AbstractNode from './abstract/AbstractNode';

export default class ProgramNode extends AbstractBodyNode {
  public errors?: ParseError[];
  public body: AbstractNode[];

  constructor(start: number, end: number) {
    super(NodeTypes.Program, { start, end });
    this.body = [];
  }

  public addError(error: unknown): void {
    if (error instanceof ParseError) {
      if (!this.errors) {
        this.errors = [];
      }

      this.errors.push(error);
    }
  }
}
