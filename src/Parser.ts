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
  public parse (template : string, options : ITokenizerOptions = {}) : IParserReturn {
    super.parse(template)
    const ast = new ProgramNode(0, template.length - 1)
    const stack : AbstractNode[] = []
    let parent : AbstractNode = ast
    let tokens : IToken[] = []

    options = {
      useSquareTags : false,
      parseLocation : true,
      ...options,
    }

    if (options.parseLocation) {
      this.addLocation(parent)
    }

    try {
      const tokenizer = new Tokenizer(options)
      tokens = tokenizer.parse(template)
      if (tokens.length === 0) {
        return { ast, tokens }
      }

      let token : IToken | null = null
      for (token of tokens) {
        const tokenType = this.tokenToNodeType(token)

        if (token.type === ENodeType.CloseDirective || token.type === ENodeType.CloseMacro) {
          if (token.params) {
            throw new ParseError(`Close tag '${tokenType}' should not have params`, token)
          }
          if (parent.type !== tokenType) {
            throw new ParseError(`Unexpected close tag '${tokenType}'`, token)
          }
          parent = stack.pop() as AbstractNode // its always

          if (options.parseLocation) {
            this.addLocation(parent)
          }
        } else {
          const node = this.addNodeChild(parent, token)
          if (node !== parent && node.hasBody) {
            if (!this.isPartial(tokenType, parent.type)) {
              stack.push(parent)
            }
            parent = node
            if (options.parseLocation) {
              this.addLocation(parent)
            }
          }
        }
      }

      if (stack.length > 0) {
        const el = stack.pop() as AbstractNode
        throw new ParseError(`Unclosed tag '${el.type}'`, el)
      }
    } catch (error) {
      if (error instanceof ParseError) {
        if (options.parseLocation) {
          this.addLocation(error)
        }
        ast.addError(error)
      } else {
        throw error
      }
    }

    return { ast, tokens }
  }

  protected addNodeChild (parent : AbstractNode, token : IToken) : AbstractNode {
    const tokenType = this.tokenToNodeType(token)

    const node : AbstractNode = Nodes[tokenType](token, parent)
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
