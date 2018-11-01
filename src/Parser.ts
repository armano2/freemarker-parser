import ParseError from './errors/ParseError'

import { IToken } from './interface/Tokens'
import { ENodeType } from './Symbols'
import { ITokenizerOptions, Tokenizer } from './Tokenizer'

import { Directives } from './enum/Directives'
import AbstractNode from './nodes/abstract/AbstractNode'
import ProgramNode from './nodes/ProgramNode'

import NodeNames from './enum/NodeNames'
import {ParserLocation} from './ParserLocation'
import Nodes from './utils/Nodes'

export interface IParserReturn {
  ast : ProgramNode
  tokens : IToken[]
}

export class Parser extends ParserLocation {
  protected options : ITokenizerOptions = {
    useSquareTags : false,
    parseLocation : true,
  }

  public parse (template : string, options : ITokenizerOptions = {}) : IParserReturn {
    super.parse(template)
    const ast = new ProgramNode(0, template.length - 1)
    const stack : AbstractNode[] = []
    let parent : AbstractNode = ast
    let tokens : IToken[] = []

    this.addLocation(parent)

    this.options = {
      useSquareTags : false,
      parseLocation : true,
      ...options,
    }

    try {
      const tokenizer = new Tokenizer(this.options)
      tokens = tokenizer.parse(template)
    } catch (error) {
      ast.addError(error)
    }

    if (tokens.length === 0) {
      this.addLocationToProgram(ast)
      return { ast, tokens }
    }

    let token : IToken | null = null
    for (token of tokens) {
      try {
        const tokenType = this.tokenToNodeType(token)

        if (token.type === ENodeType.CloseDirective || token.type === ENodeType.CloseMacro) {
          if (token.params) {
            ast.addError(new ParseError(`Close tag '${tokenType}' should have no params`, token))
            continue
          }
          if (parent.type !== tokenType) {
            ast.addError(new ParseError(`Unexpected close tag '${tokenType}'`, token))
            continue
          }
          parent = stack.pop() as AbstractNode // its always
        } else {
          const node = this.addNodeChild(parent, token)
          if (node !== parent && node.hasBody) {
            if (!this.isPartial(tokenType, parent.type)) {
              stack.push(parent)
            }
            parent = node
          }
        }
      } catch (error) {
        ast.addError(error)
      }
    }

    if (stack.length > 0) {
      ast.addError(new ParseError(`Unclosed tag '${parent.type}'`, parent))
    }

    this.addLocationToProgram(ast)
    return { ast, tokens }
  }

  protected addLocationToProgram (parent : ProgramNode) {
    if (this.options.parseLocation) {
      if (parent.errors) {
        for (const node of parent.errors) {
          this.addLocation(node)
        }
      }
    }
  }

  protected addNodeChild (parent : AbstractNode, token : IToken) : AbstractNode {
    const tokenType = this.tokenToNodeType(token)

    const node : AbstractNode = Nodes[tokenType](token, parent)
    if (node) {
      this.addLocation(node)
    }
    if (parent !== node) {
      parent.addToNode(node)
    }
    return node
  }

  protected isPartial (type : NodeNames, parentType : NodeNames) : boolean {
    switch (type) {
      case NodeNames.ConditionElse:
        return NodeNames.Condition === parentType
      case NodeNames.Else:
        return NodeNames.Condition === parentType || NodeNames.List === parentType
      case NodeNames.Recover:
        return NodeNames.Attempt === parentType
    }

    return false
  }

  protected tokenToNodeType (token : IToken) : NodeNames {
    switch (token.type) {
      case ENodeType.CloseDirective:
      case ENodeType.OpenDirective:
        if (token.text in Directives) {
          return Directives[token.text as any] as NodeNames
        }
        break
      case ENodeType.Interpolation:
        return NodeNames.Interpolation
      case ENodeType.Text:
        return NodeNames.Text
      case ENodeType.CloseMacro:
      case ENodeType.OpenMacro:
        return NodeNames.MacroCall
      case ENodeType.Comment:
        return NodeNames.Comment
    }
    throw new ParseError(`Unknown token \`${token.type}\` - \`${token.text}\``, token)
  }
}
