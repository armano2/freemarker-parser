import ECharCodes from '../enum/CharCodes';
import { BinaryOps } from '../enum/Operators';

export function isDecimalDigit(ch: number): boolean {
  return ch >= ECharCodes._0 && ch <= ECharCodes._9; // 0...9
}

export function isLetter(ch: number): boolean {
  return (
    (ch >= ECharCodes.a && ch <= ECharCodes.z) || // a...z
    (ch >= ECharCodes.A && ch <= ECharCodes.Z)
  ); // A...Z
}

export function isWhitespace(ch: number): boolean {
  return (
    ch === ECharCodes.Space ||
    ch === ECharCodes.Tab ||
    ch === ECharCodes.CarriageReturn ||
    ch === ECharCodes.LineFeed
  );
}

// any non-ASCII that is not an operator
export function isIdentifierStart(ch: number): boolean {
  return (
    (isLetter(ch) ||
      ch === ECharCodes.$ ||
      ch === ECharCodes.Underscore || // `$` and `_`
      ch >= 128) &&
    !BinaryOps[String.fromCharCode(ch)]
  );
}

// any non-ASCII that is not an operator
export function isIdentifierPart(ch: number): boolean {
  return (
    (isLetter(ch) ||
      isDecimalDigit(ch) ||
      ch === ECharCodes.$ ||
      ch === ECharCodes.Underscore || // `$` and `_`
      ch >= 128) &&
    !BinaryOps[String.fromCharCode(ch)]
  );
}
