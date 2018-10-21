import NodeError from './errors/NodeError'

import { Tokenizer } from './Tokenizer'
import { IToken } from './types/Tokens'

import AbstractNode from './types/Nodes/AbstractNode'
import IProgram from './types/Nodes/IProgram'
import { addNodeChild, isPartial, tokenToNodeType } from './utils/Token'

export interface IParserReturn {
  ast : IProgram
  tokens : IToken[]
}

export class Parser {
  public parse (template : string) : IParserReturn {
    const ast = new IProgram(0, template.length)
    const stack : AbstractNode[] = []
    let parent : AbstractNode = ast
    let tokens : IToken[] = []

    try {
      const tokenizer = new Tokenizer()
      tokens = tokenizer.parse(template)
      if (tokens.length === 0) {
        return { ast, tokens }
      }

      let token : IToken | null = null
      for (token of tokens) {
        const tokenType = tokenToNodeType(token)

        if (token.isClose) {
          if (token.params) {
            throw new NodeError(`Close tag '${tokenType}' should not have params`, token)
          }
          if (parent.type !== tokenType) {
            throw new NodeError(`Unexpected close tag '${tokenType}'`, token)
          }
          parent = stack.pop() as AbstractNode // its always
        } else {
          const node = addNodeChild(parent, token)
          if (node !== parent && node.hasBody) {
            if (!isPartial(tokenType, parent.type)) {
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
}
