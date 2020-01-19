import ParamNames from '../enum/ParamNames';

export interface Expression {
  type: ParamNames;
}

export interface Compound extends Expression {
  type: ParamNames.Compound;
  body: AllParamTypes[];
}

export interface Literal extends Expression {
  type: ParamNames.Literal;
  value: string | number | boolean | null;
  raw: string;
}

export interface ArrayExpression extends Expression {
  type: ParamNames.ArrayExpression;
  elements: AllParamTypes[];
}

export interface Identifier extends Expression {
  type: ParamNames.Identifier;
  name: string;
}

export interface BinaryExpression extends Expression {
  type: ParamNames.BinaryExpression;
  operator: string;
  left: AllParamTypes;
  right: AllParamTypes;
}

export interface LogicalExpression extends Expression {
  type: ParamNames.LogicalExpression;
  operator: string;
  left: AllParamTypes;
  right: AllParamTypes;
}

export interface UnaryExpression extends Expression {
  type: ParamNames.UnaryExpression;
  operator: string;
  argument: AllParamTypes;
  prefix: boolean;
}

export interface MemberExpression extends Expression {
  type: ParamNames.MemberExpression;
  computed: boolean;
  object: AllParamTypes;
  property: AllParamTypes | null;
}

export interface CallExpression extends Expression {
  type: ParamNames.CallExpression;
  arguments: AllParamTypes[];
  callee: AllParamTypes;
}

export interface AssignmentExpression extends Expression {
  type: ParamNames.AssignmentExpression;
  operator: string;
  left: AllParamTypes;
  right: AllParamTypes;
}

export interface BuiltInExpression {
  type: ParamNames.BuiltInExpression;
  operator: string;
  left: AllParamTypes;
  right: AllParamTypes;
}

export interface UpdateExpression extends Expression {
  type: ParamNames.UpdateExpression;
  operator: string;
  prefix: boolean;
  argument: AllParamTypes;
}

export interface MapExpressionValues {
  key: Literal;
  value: AllParamTypes;
}

export interface MapExpression extends Expression {
  type: ParamNames.MapExpression;
  elements: MapExpressionValues[];
}

export type AllParamTypes =
  | Literal
  | ArrayExpression
  | Identifier
  | BinaryExpression
  | LogicalExpression
  | UnaryExpression
  | BuiltInExpression
  | MemberExpression
  | CallExpression
  | Compound
  | AssignmentExpression
  | UpdateExpression
  | MapExpression;
