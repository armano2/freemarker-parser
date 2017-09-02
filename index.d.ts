// Generated by dts-bundle v0.7.3

declare module 'freemarkerjs' {
    import { Parser } from 'freemarkerjs/Parser';
    export { Parser };
}

declare module 'freemarkerjs/Parser' {
    import { IProgram } from 'freemarkerjs/nodes/Types';
    export class Parser {
        parse(template: string): IProgram;
    }
}

declare module 'freemarkerjs/nodes/Types' {
    import { IExpression } from 'freemarkerjs/params/Types';
    export enum NodeNames {
        Program = "Program",
        Else = "Else",
        Condition = "Condition",
        Include = "Include",
        List = "List",
        Text = "Text",
        Assign = "Assign",
        Global = "Global",
        Local = "Local",
        Macro = "Macro",
        MacroCall = "MacroCall",
        Interpolation = "Interpolation",
        Attempt = "Attempt",
        Recover = "Recover",
        ConditionElse = "ConditionElse",
    }
    export interface IParams extends Array<IExpression> {
        [i: number]: IExpression;
    }
    export interface INode {
        type: NodeNames;
        start: number;
        end: number;
    }
    export interface IProgram extends INode {
        type: NodeNames.Program;
        body: INode[];
    }
    export interface ICondition extends INode {
        type: NodeNames.Condition;
        params: IParams;
        consequent: INode[];
        alternate?: IElse | ICondition;
    }
    export interface IElse extends INode {
        type: NodeNames.Else;
        body: INode[];
    }
    export interface IInclude extends INode {
        type: NodeNames.Include;
        params: IParams;
    }
    export interface IList extends INode {
        type: NodeNames.List;
        params: IParams;
        body: INode[];
        fallback?: IElse;
    }
    export interface IText extends INode {
        type: NodeNames.Text;
        text: string;
    }
    export interface IMacro extends INode {
        type: NodeNames.Macro;
        params: IParams;
        body: INode[];
    }
    export interface IMacroCall extends INode {
        type: NodeNames.MacroCall;
        params: IParams;
        name: string;
        body?: INode[];
    }
    export interface IAssign extends INode {
        type: NodeNames.Assign;
        params: IParams;
    }
    export interface IGlobal extends INode {
        type: NodeNames.Global;
        params: IParams;
    }
    export interface ILocal extends INode {
        type: NodeNames.Local;
        params: IParams;
    }
    export interface IInterpolation extends INode {
        type: NodeNames.Interpolation;
        params: IParams;
    }
    export interface IAttempt extends INode {
        type: NodeNames.Attempt;
        body: INode[];
        fallback?: IRecover;
    }
    export interface IRecover extends INode {
        type: NodeNames.Recover;
        body: INode[];
    }
    export type AllNodeTypes = IInterpolation | IMacroCall | IProgram | IText | ICondition | IElse | IList | IGlobal | ILocal | IAssign | IInclude | IMacro | IAttempt | IRecover;
}

declare module 'freemarkerjs/params/Types' {
    export interface IExpression {
        type: string;
    }
    export interface ILiteral extends IExpression {
        type: 'Literal';
        value: any;
        raw: string;
    }
    export interface IArrayExpression extends IExpression {
        type: 'ArrayExpression';
        elements: IExpression[];
    }
    export interface IIdentifier extends IExpression {
        type: 'Identifier';
        name: string;
    }
    export interface IBinaryExpression extends IExpression {
        type: 'BinaryExpression';
        operator: string;
        left: IExpression;
        right: IExpression;
    }
    export interface ILogicalExpression extends IExpression {
        type: 'LogicalExpression';
        operator: string;
        left: IExpression;
        right: IExpression;
    }
    export interface IUnaryExpression extends IExpression {
        type: 'UnaryExpression';
        operator: string;
        argument: IExpression;
        prefix: boolean;
    }
    export interface IMemberExpression extends IExpression {
        type: 'MemberExpression';
        computed: boolean;
        object: IExpression;
        property: IExpression | null;
    }
    export interface ICallExpression extends IExpression {
        type: 'ConditionalExpression';
        arguments: IExpression;
        callee: IExpression;
    }
    export interface IUnaryOperators {
        [n: string]: boolean;
    }
    export interface IBinaryOperators {
        [n: string]: number;
    }
    export interface ILiteralOperators {
        [n: string]: true | false | null;
    }
}
