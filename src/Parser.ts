import { format } from 'util'
import NodeError from './errors/NodeError'

import { Tokenizer } from './Tokenizer'
import { IToken } from './types/Tokens'

import { AllNodeTypes, IProgram } from './types/Node'
import { cProgram } from './utils/Node'
import { addNodeChild, EClosingType, isClosing, tokenToNodeType } from './utils/Token'

export interface IParserReturn {
  ast : IProgram
  tokens : IToken[]
}

const errorMessages = {
  [EClosingType.No]: 'Unexpected close tag \`%s\`',
  [EClosingType.Ignore]: '\`%s\` can\'t self close',
  [EClosingType.Partial]: '\`%s\` can\'t self close',
}

export class Parser {
  public parse (template : string) : IParserReturn {
    const ast = cProgram(0, template.length)
    const stack : AllNodeTypes[] = []
    let parent : AllNodeTypes = ast

    const tokenizer = new Tokenizer()
    const tokens = tokenizer.parse(template)
    if (tokens.length === 0) {
      return { ast, tokens }
    }

    let token : IToken | null = null
    for (token of tokens) {
      const tokenType = tokenToNodeType(token)

      const closing = isClosing(tokenType, parent.type, token.isClose)

      if (token.isClose) {
        if (closing !== EClosingType.Yes) {
          throw new NodeError(format(errorMessages[closing], token.type), token)
        }

        const parentNode = stack.pop()
        if (!parentNode) {
          throw new NodeError(`Stack is empty`, token)
        }
        parent = parentNode

      } else {
        const node = addNodeChild(parent, token)
        if (closing !== EClosingType.Ignore) {
          if (closing !== EClosingType.Partial) {
            stack.push(parent)
          }
          parent = node
        }
      }
    }

    if (stack.length > 0) {
      throw new NodeError(`Unclosed tag`, token ? token : stack[0])
    }
    return { ast, tokens }
  }
}
