import lineColumn from 'line-column'
import { BaseNode } from '../nodes/BaseNode'
import { Parser } from '../Parser'
import ParserError from './ParserError'

export default class NodeError extends ParserError {
  constructor (m : string, node : BaseNode, parser : Parser | null) {
    m = `${m}: ${node.$nodeType} (${node.start}-${node.end})`
    if (parser && parser.filename) {
      const loc = lineColumn(parser.template).fromIndex(node.start)
      m += `\n - ${parser.filename}:${loc ? `${loc.line}:${loc.col}` : '0:0'}`
    }
    super(m)
  }
}
