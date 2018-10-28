import ECharCodes from './enum/CharCodes'
import { ISourceLocation } from './types/ISourceLocation'
import {ILoc} from './types/Tokens'

export abstract class ParserLocation {
  protected offsets : number[] = [0]
  protected template : string = ''

  public parse (template : string) {
    this.template = template || ''

    const offsets = [0]

    for (let offset = 0; offset < template.length;) {
      switch (this.template.charCodeAt(offset)) {
        case ECharCodes.LineFeed:
          offset += 1
          offsets.push(offset)
          break
        case ECharCodes.CarriageReturn:
          offset += 1
          if (this.template.charCodeAt(offset) === ECharCodes.LineFeed) {
            offset += 1
          }
          offsets.push(offset)
          break
        default:
          ++offset
          break
      }
    }

    this.offsets = offsets
  }

  protected findLowerIndexInRangeArray (value : number) {
    if (value >= this.offsets[this.offsets.length - 1]) {
      return this.offsets.length - 1
    }

    let min = 0
    let max = this.offsets.length - 2
    let mid
    while (min < max) {
      mid = min + ((max - min) >> 1)

      if (value < this.offsets[mid]) {
        max = mid - 1
      } else if (value >= this.offsets[mid + 1]) {
        min = mid + 1
      } else { // value >= this.offsets[mid] && value < this.offsets[mid + 1]
        min = mid
        break
      }
    }
    return min
  }

  protected addLocation (node : ILoc) {
    node.loc = {
      start : this.locationForIndex(node.start),
      end : this.locationForIndex(node.end),
    }
  }

  protected locationForIndex (index : number) : ISourceLocation {
    if (index < 0 || index >= this.template.length || isNaN(index)) {
      return { line : 0, column : 0}
    }

    const line = this.findLowerIndexInRangeArray(index)
    const column = index - this.offsets[line]

    return { line : line + 1, column : column + 1 }
  }
}
