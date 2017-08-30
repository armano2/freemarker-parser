import { ETypeSymbol } from './Types'

export interface ISymbol {
  startToken : string
  endToken : string
  type : ETypeSymbol
}

export const symbols : ISymbol[] = [
  { startToken: '</#', endToken: '>', type: ETypeSymbol.DirectiveEnd },
  { startToken: '<#', endToken: '>', type: ETypeSymbol.Directive },
  { startToken: '<@', endToken: '>', type: ETypeSymbol.Macro },
  // tslint:disable-next-line:no-invalid-template-strings
  { startToken: '${', endToken: '}', type: ETypeSymbol.Interpolation },
]

export const whitespaces : string[] = [
  ' ',
  '\t',
  '\n',
  '\r',
]
