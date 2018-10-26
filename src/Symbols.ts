export enum ENodeType {
  Program = 'Program',
  Directive = 'Directive',
  Macro = 'Macro',
  Text = 'Text',
  Interpolation = 'Interpolation',
  Comment = 'Comment',
}

export interface ISymbol {
  startToken : string
  endToken : string[]
  type : ENodeType
  end : boolean
}
