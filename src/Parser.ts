import NodeError from './errors/NodeError'

import { ENodeType } from './Symbols'
import { ITokenizerOptions, Tokenizer } from './Tokenizer'
import { IToken } from './types/Tokens'

import AbstractNode from './types/Nodes/AbstractNode'
import IProgram from './types/Nodes/IProgram'
import directives from './utils/Directives'

import NodeNames from './enum/NodeNames'
import Nodes from './utils/Nodes'

export interface IParserReturn {
  ast : IProgram
  tokens : IToken[]
}

export class Parser {
  public parse (template : string, options? : ITokenizerOptions) : IParserReturn {
    const ast = new IProgram(0, template.length)
    const stack : AbstractNode[] = []
    let parent : AbstractNode = ast
    let tokens : IToken[] = []

    try {
      const tokenizer = new Tokenizer(options)
      tokens = tokenizer.parse(template)
      if (tokens.length === 0) {
        return { ast, tokens }
      }

      let token : IToken | null = null
      for (token of tokens) {
        const tokenType = this.tokenToNodeType(token)

        if (token.isClose) {
          if (token.params) {
            throw new NodeError(`Close tag '${tokenType}' should not have params`, token)
          }
          if (parent.type !== tokenType) {
            throw new NodeError(`Unexpected close tag '${tokenType}'`, token)
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
      }

      if (stack.length > 0) {
        const el = stack.pop() as AbstractNode
        throw new NodeError(`Unclosed tag '${el.type}'`, el)
      }
    } catch (e) {
      ast.addError(e, template)
    }

    return { ast, tokens }
  }

  protected addNodeChild (parent : AbstractNode, token : IToken) : AbstractNode {
    const tokenType = this.tokenToNodeType(token)
    if (tokenType in Nodes) {
      const node : AbstractNode = Nodes[tokenType](token, parent)
      if (parent !== node) {
        parent.addToNode(node)
      }
      return node
    }

    throw new NodeError(`Unknown '${tokenType}'`, token)
  }

  protected isPartial (type : NodeNames, parentType : NodeNames) : boolean {
    switch (type) {
      case NodeNames.ConditionElse:
        return NodeNames.Condition === parentType
      case NodeNames.Else:
        return (NodeNames.Condition === parentType || NodeNames.List === parentType)
      case NodeNames.Recover:
        return (NodeNames.Attempt === parentType)
    }

    return false
  }

  protected tokenToNodeType (token : IToken) : NodeNames {
    switch (token.type) {
      case ENodeType.Directive:
        if (token.text in directives) {
          return directives[token.text]
        }
        throw new NodeError(`Directive \`${token.text}\` is not supported`, token)
      case ENodeType.Interpolation:
        return NodeNames.Interpolation
      case ENodeType.Text:
        return NodeNames.Text
      case ENodeType.Macro:
        return NodeNames.MacroCall
      case ENodeType.Comment:
        return NodeNames.Comment
    }
    throw new NodeError(`Unknow token \`${token.type}\` - \`${token.text}\``, token)
  }
}
