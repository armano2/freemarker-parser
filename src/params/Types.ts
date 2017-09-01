export interface IExpression {
  type : string
}

export interface ILiteral extends IExpression {
  type : 'Literal'
  value : any
  raw : string
}

export interface IArrayExpression extends IExpression {
  elements : IExpression[]
}

export interface IIdentifier extends IExpression {
  type : 'Identifier'
  name : string
}

export interface IBinaryExpression extends IExpression {
  type : 'BinaryExpression'
  operator : string
  left : IExpression
  right : IExpression
}

export interface ILogicalExpression extends IExpression {
  type : 'LogicalExpression'
  operator : string
  left : IExpression
  right : IExpression
}

export interface IUnaryExpression extends IExpression {
  type : 'UnaryExpression'
  operator : string
  argument : IExpression
  prefix : boolean
}

export interface IMemberExpression extends IExpression {
  type : 'MemberExpression'
  computed : boolean
  object : IExpression
  property : IExpression | null
}

export interface ICallExpression extends IExpression {
  type : 'ConditionalExpression'
  arguments : IExpression
  callee : IExpression
}

// ------------------

export interface IUnaryOperators {
  [n : string] : boolean
}
export interface IBinaryOperators {
  [n : string] : number
}
export interface ILiteralOperators {
  [n : string] : true | false | null
}
