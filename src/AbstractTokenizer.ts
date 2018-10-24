export default abstract class AbstractTokenizer {
  protected template : string = ''
  protected length : number = 0
  protected index : number = 0

  protected charAt (i : number) : string {
    return this.template.charAt(i)
  }

  protected charCodeAt (i : number) : number {
    return this.template.charCodeAt(i)
  }

  protected init (template : string) : void {
    this.template = template
    this.length = template.length
    this.index = 0
  }
}
