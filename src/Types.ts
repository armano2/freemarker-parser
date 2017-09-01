import { IExpression } from './params/Types'

export interface IParams extends Array<IExpression> {
  [i : number] : IExpression
}
