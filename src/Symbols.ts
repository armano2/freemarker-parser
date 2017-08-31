import { ENodeType } from './Types'

export interface ISymbol {
  startToken : string
  endToken : string
  type : ENodeType
  end : boolean
}

export const symbols : ISymbol[] = [
  { startToken: '</#', endToken: '>', type: ENodeType.Directive, end: true },
  { startToken: '<#', endToken: '>', type: ENodeType.Directive, end: false },
  { startToken: '</@', endToken: '>', type: ENodeType.Macro, end: true },
  { startToken: '<@', endToken: '>', type: ENodeType.Macro, end: false },
  // tslint:disable-next-line:no-invalid-template-strings
  { startToken: '${', endToken: '}', type: ENodeType.Interpolation, end: false },
]

export const whitespaces : string[] = [
  ' ',
  '\t',
  '\n',
  '\r',
]
