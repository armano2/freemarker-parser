import { ETypeSymbol } from './Types'

export interface ISymbol {
  startToken : string
  endToken : string
  type : ETypeSymbol
}

export const symbols : ISymbol[] = [
  { startToken: '<#', endToken: '>', type: ETypeSymbol.Directive },
  { startToken: '<@', endToken: '>', type: ETypeSymbol.Macro },
  // tslint:disable-next-line:no-invalid-template-strings
  { startToken: '${', endToken: '}', type: ETypeSymbol.Print },
]

export const whitespaces : string[] = [
  ' ',
  '\t',
  '\n',
  '\r',
]
