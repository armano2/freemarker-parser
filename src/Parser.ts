import ParseError from './errors/ParseError';

import { Options } from './interface/Options';
import { Token } from './interface/Tokens';

import { NodeType } from './Symbols';
import { Tokenizer } from './Tokenizer';

import { Directives } from './enum/Directives';
import NodeNames from './enum/NodeNames';

import AbstractNode from './nodes/abstract/AbstractNode';
import ProgramNode from './nodes/ProgramNode';

import { ParserLocation } from './ParserLocation';
import Nodes from './utils/Nodes';

import defaultConfig from './defaultConfig';

export interface ParserReturn {
  ast: ProgramNode;
  tokens: Token[];
}

export class Parser extends ParserLocation {
  protected options: Options = defaultConfig;

  public parse(template: string, options: Options = {}): ParserReturn {
    super.parse(template);
    const ast = new ProgramNode(0, template.length - 1);
    const stack: AbstractNode[] = [];
    let parent: AbstractNode = ast;
    let tokens: Token[] = [];

    this.addLocation(parent);

    this.options = {
      ...defaultConfig,
      ...options,
    };

    try {
      const tokenizer = new Tokenizer(this.options);
      tokens = tokenizer.parse(template);
    } catch (error) {
      ast.addError(error);
    }

    if (tokens.length === 0) {
      this.addLocationToProgram(ast);
      return { ast, tokens };
    }

    let token: Token | null = null;
    for (token of tokens) {
      try {
        const tokenType = this.tokenToNodeType(token);

        if (
          token.type === NodeType.CloseDirective ||
          token.type === NodeType.CloseMacro
        ) {
          if (token.params) {
            ast.addError(
              new ParseError(
                `Close tag '${tokenType}' should have no params`,
                token,
              ),
            );
            continue;
          }
          if (parent.type !== tokenType) {
            ast.addError(
              new ParseError(`Unexpected close tag '${tokenType}'`, token),
            );
            continue;
          }
          parent = stack.pop() as AbstractNode; // its always
        } else {
          const node = this.addNodeChild(parent, token);
          if (node !== parent && node.hasBody) {
            if (!this.isPartial(tokenType, parent.type)) {
              stack.push(parent);
            }
            parent = node;
          }
        }
      } catch (error) {
        ast.addError(error);
      }
    }

    if (stack.length > 0) {
      ast.addError(new ParseError(`Unclosed tag '${parent.type}'`, parent));
    }

    this.addLocationToProgram(ast);
    return { ast, tokens };
  }

  protected addLocationToProgram(parent: ProgramNode): void {
    if (this.options.parseLocation) {
      if (parent.errors) {
        for (const node of parent.errors) {
          this.addLocation(node);
        }
      }
    }
  }

  protected addNodeChild(parent: AbstractNode, token: Token): AbstractNode {
    const tokenType = this.tokenToNodeType(token);

    const node: AbstractNode = Nodes[tokenType](token, parent);
    if (node) {
      this.addLocation(node);
    }
    if (parent !== node) {
      parent.addToNode(node);
    }
    return node;
  }

  protected isPartial(type: NodeNames, parentType: NodeNames): boolean {
    switch (type) {
      case NodeNames.ConditionElse:
        return NodeNames.Condition === parentType;
      case NodeNames.Else:
        return (
          NodeNames.Condition === parentType || NodeNames.List === parentType
        );
      case NodeNames.Recover:
        return NodeNames.Attempt === parentType;
    }

    return false;
  }

  protected tokenToNodeType(token: Token): NodeNames {
    switch (token.type) {
      case NodeType.CloseDirective:
      case NodeType.OpenDirective:
        if (token.text in Directives) {
          return Directives[token.text as any] as NodeNames;
        }
        break;
      case NodeType.Interpolation:
        return NodeNames.Interpolation;
      case NodeType.Text:
        return NodeNames.Text;
      case NodeType.CloseMacro:
      case NodeType.OpenMacro:
        return NodeNames.MacroCall;
      case NodeType.Comment:
        return NodeNames.Comment;
    }
    throw new ParseError(
      `Unknown token \`${token.type}\` - \`${token.text}\``,
      token,
    );
  }
}
