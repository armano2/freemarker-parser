import { EType } from './Types'

export interface ILoc {
  startPos : number
  endPos : number
}

export interface IBaseNode {
  type : EType
  children : INode[]
}

export interface INode extends IBaseNode {
  tag : string
  params : string[]
  text : string
  loc : ILoc
}

export interface IToken {
  type : EType
  tag : string
  isClose : boolean
  params : string[]
  text : string
  loc : ILoc
}
