import { EType } from './Types'

export interface ILoc {
  startPos : number
  endPos : number
}

export interface INode {
  type : EType
  tag : string
  children : INode[]
  params : string[]
  text : string
  loc : ILoc
}
