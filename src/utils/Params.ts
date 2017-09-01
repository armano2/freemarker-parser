import { ParamsParser } from '../params/ParamsParser'
import { IParams } from '../Types'

export function parseParams (tokenParams : string[]) : IParams {
  const parser = new ParamsParser()
  const params : IParams = []
  for (const param of tokenParams) {
    params.push(parser.parse(param))
  }
  return params
}
