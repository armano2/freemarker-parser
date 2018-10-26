import NodeError from '../errors/NodeError'
import { ParamsParser } from '../ParamsParser'
import { AllParamTypes } from '../types/Params'

export function paramParser (start : number, end : number, params? : string) : AllParamTypes | undefined {
  if (params) {
    const parser = new ParamsParser()
    try {
    return parser.parse(params)
    } catch (e) {
      throw new NodeError(e.message, { start: start + e.start, end })
    }
  } else {
    return undefined
  }
}
