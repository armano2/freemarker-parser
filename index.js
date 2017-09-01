'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class ParserError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, ParserError.prototype);
    }
}
//# sourceMappingURL=ParserError.js.map

class NodeError extends ParserError {
    constructor(m, node) {
        m = `${node.$nodeType}(${node.start}-${node.end}) - ${m}`;
        super(m);
        this.node = node;
    }
}
//# sourceMappingURL=NodeError.js.map

var ENodeType;
(function (ENodeType) {
    ENodeType["Program"] = "Program";
    ENodeType["Directive"] = "Directive";
    ENodeType["Macro"] = "Macro";
    ENodeType["Text"] = "Text";
    ENodeType["Interpolation"] = "Interpolation";
})(ENodeType || (ENodeType = {}));
var EType;
(function (EType) {
    EType["Program"] = "@program";
    EType["Text"] = "@text";
    EType["MacroCall"] = "@macro";
    EType["Interpolation"] = "@interpolation";
    EType["if"] = "if";
    EType["else"] = "else";
    EType["elseif"] = "elseif";
    EType["list"] = "list";
    EType["include"] = "include";
    EType["assign"] = "assign";
    EType["attempt"] = "attempt";
    EType["compress"] = "compress";
    EType["escape"] = "escape";
    EType["noescape"] = "noescape";
    EType["fallback"] = "fallback";
    EType["function"] = "function";
    EType["flush"] = "flush";
    EType["global"] = "global";
    EType["import"] = "import";
    EType["local"] = "local";
    EType["lt"] = "lt";
    EType["macro"] = "macro";
    EType["nested"] = "nested";
    EType["nt"] = "nt";
    EType["recover"] = "recover";
    EType["recurse"] = "recurse";
    EType["return"] = "return";
    EType["rt"] = "rt";
    EType["setting"] = "setting";
    EType["stop"] = "stop";
    EType["switch"] = "switch";
    EType["case"] = "case";
    EType["break"] = "break";
    EType["t"] = "t";
    EType["visit"] = "visit";
})(EType || (EType = {}));
//# sourceMappingURL=Types.js.map

const NodeConfig = {
    [EType.Program]: {
        isSelfClosing: false,
        disallowParams: true,
    },
    [EType.Text]: {
        isSelfClosing: true,
        disallowParams: true,
    },
    [EType.MacroCall]: {
        isSelfClosing: true,
    },
    [EType.Interpolation]: {
        isSelfClosing: true,
    },
    [EType.include]: {
        isSelfClosing: true,
    },
    [EType.assign]: {
        isSelfClosing: true,
    },
    [EType.if]: {
        isSelfClosing: false,
    },
    [EType.else]: {
        isSelfClosing: true,
        onlyIn: [EType.if, EType.elseif, EType.list],
        disallowParams: true,
    },
    [EType.elseif]: {
        isSelfClosing: true,
        onlyIn: [EType.if],
    },
    [EType.list]: {
        isSelfClosing: false,
    },
    [EType.attempt]: {
        isSelfClosing: false,
    },
    [EType.recurse]: {
        isSelfClosing: true,
    },
    [EType.compress]: {
        isSelfClosing: false,
    },
    [EType.escape]: {
        isSelfClosing: false,
    },
    [EType.noescape]: {
        isSelfClosing: false,
    },
    [EType.fallback]: {
        isSelfClosing: true,
    },
    [EType.function]: {
        isSelfClosing: false,
    },
    [EType.flush]: {
        isSelfClosing: true,
    },
    [EType.global]: {
        isSelfClosing: true,
    },
    [EType.import]: {
        isSelfClosing: true,
    },
    [EType.local]: {
        isSelfClosing: true,
    },
    [EType.lt]: {
        isSelfClosing: true,
    },
    [EType.macro]: {
        isSelfClosing: false,
    },
    [EType.nested]: {
        isSelfClosing: true,
    },
    [EType.nt]: {
        isSelfClosing: true,
    },
    [EType.recover]: {
        isSelfClosing: true,
    },
    [EType.return]: {
        isSelfClosing: true,
    },
    [EType.rt]: {
        isSelfClosing: true,
    },
    [EType.setting]: {
        isSelfClosing: true,
    },
    [EType.stop]: {
        isSelfClosing: true,
    },
    [EType.switch]: {
        isSelfClosing: true,
    },
    [EType.case]: {
        isSelfClosing: true,
    },
    [EType.break]: {
        isSelfClosing: true,
    },
    [EType.t]: {
        isSelfClosing: true,
    },
    [EType.visit]: {
        isSelfClosing: true,
    },
};
//# sourceMappingURL=NodeConfig.js.map

class BaseNode {
    constructor(nodeType, start, end, eType) {
        this.type = this.constructor.name;
        this.$nodeType = nodeType;
        this.$eType = eType;
        this.start = start;
        this.end = end;
        this.$config = NodeConfig[eType];
        if (!this.$config) {
            throw new NodeError(`Invalid Token`, this);
        }
    }
    canAddTo(node) {
        return !this.$config.onlyIn || Boolean(this.$config.onlyIn.find((item) => item === node.$eType));
    }
    addChild(node) {
        throw new NodeError(`Unsupported ${this.constructor.name}:addChild(${node.$nodeType})`, this);
    }
}
//# sourceMappingURL=BaseNode.js.map

class Directive extends BaseNode {
    constructor(name, params, start, end) {
        super(ENodeType.Directive, start, end, name);
        this.name = name;
        this.params = params;
    }
}
//# sourceMappingURL=Directive.js.map

class IfCondtion extends Directive {
    constructor(name, params, start, end) {
        super(name, params, start, end);
        this.consequent = [];
        this.alternate = [];
        this.$inElse = false;
    }
    addChild(node) {
        if (node instanceof Directive) {
            if ((node.name === EType.else || node.name === EType.elseif) && this.$inElse) {
                throw new ParserError(`Unexpected token <#${node.name}>`);
            }
            if (node.name === EType.else) {
                this.$inElse = true;
                return this;
            }
            if (node.name === EType.elseif) {
                this.$inElse = true;
                this.pushChild(node);
                return node;
            }
        }
        this.pushChild(node);
        return this;
    }
    pushChild(node) {
        if (this.$inElse) {
            this.alternate.push(node);
        }
        else {
            this.consequent.push(node);
        }
    }
}
//# sourceMappingURL=IfCondtion.js.map

class Include extends Directive {
    constructor(name, params, start, end) {
        super(name, params, start, end);
    }
    addChild(node) {
        throw new NodeError(`Unsupported ${this.constructor.name}:addChild(${node.$nodeType})`, this);
    }
}
//# sourceMappingURL=Include.js.map

class List extends Directive {
    constructor(name, params, start, end) {
        super(name, params, start, end);
        this.body = [];
        this.fallback = [];
        this.$inElse = false;
    }
    addChild(node) {
        if (node instanceof Directive) {
            if (node.name === EType.else) {
                if (this.$inElse) {
                    throw new ParserError(`Unexpected token <#${EType.else}>`);
                }
                this.$inElse = true;
                return this;
            }
        }
        this.pushChild(node);
        return this;
    }
    pushChild(node) {
        if (this.$inElse) {
            this.fallback.push(node);
        }
        else {
            this.body.push(node);
        }
    }
}
//# sourceMappingURL=List.js.map

class UnknownDirective extends Directive {
    constructor(name, params, start, end) {
        super(name, params, start, end);
        this.children = [];
    }
    addChild(node) {
        this.children.push(node);
        return this;
    }
}
//# sourceMappingURL=UnknownDirective.js.map

class Interpolation extends BaseNode {
    constructor(start, end, params) {
        super(ENodeType.Interpolation, start, end, EType.Interpolation);
        this.params = params;
    }
}
//# sourceMappingURL=Interpolation.js.map

class Macro extends BaseNode {
    constructor(name, params, start, end) {
        super(ENodeType.Macro, start, end, EType.MacroCall);
        this.name = name;
        this.params = params;
    }
}
//# sourceMappingURL=Macro.js.map

class Text extends BaseNode {
    constructor(text = '', start, end) {
        super(ENodeType.Text, start, end, EType.Text);
        this.text = '';
        this.text = text;
    }
}
//# sourceMappingURL=Text.js.map

class ParamError extends ParserError {
    constructor(message, index) {
        super(`${message} at character ${index}`);
        this.description = message;
        this.index = index;
    }
}
//# sourceMappingURL=ParamError.js.map

const COMPOUND = 'Compound';
const IDENTIFIER = 'Identifier';
const MEMBER_EXP = 'MemberExpression';
const LITERAL = 'Literal';
const CALL_EXP = 'CallExpression';
const UNARY_EXP = 'UnaryExpression';
const BINARY_EXP = 'BinaryExpression';
const LOGICAL_EXP = 'LogicalExpression';
const ARRAY_EXP = 'ArrayExpression';
const PERIOD_CODE = 46;
const COMMA_CODE = 44;
const SQUOTE_CODE = 39;
const DQUOTE_CODE = 34;
const OPAREN_CODE = 40;
const CPAREN_CODE = 41;
const OBRACK_CODE = 91;
const CBRACK_CODE = 93;
const SEMCOL_CODE = 59;
const unaryOps = { '-': true, '!': true, '~': true, '+': true, '?': true, '=': true };
const binaryOps = {
    '||': 1,
    '&&': 2,
    '^': 4,
    '&': 5,
    '==': 6, '!=': 6, '===': 6, '!==': 6,
    '<': 7, '>': 7, '<=': 7, '>=': 7, 'gt': 7, 'lt': 7, 'gte': 7, 'lte': 7,
    '+': 9, '-': 9,
    '*': 10, '/': 10, '%': 10,
};
function getMaxKeyLen(obj) {
    let maxLen = 0;
    let len;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            len = key.length;
            if (len > maxLen) {
                maxLen = len;
            }
        }
    }
    return maxLen;
}
const maxUnopLen = getMaxKeyLen(unaryOps);
const maxBinopLen = getMaxKeyLen(binaryOps);
const literals = {
    true: true,
    false: false,
    null: null,
};
function isIBiopInfo(object) {
    return object && 'prec' in object;
}
function isIExpression(object) {
    return object && 'type' in object;
}
const binaryPrecedence = (opVal) => binaryOps[opVal] || 0;
function createBinaryExpression(operator, left, right) {
    const type = (operator === '||' || operator === '&&') ? LOGICAL_EXP : BINARY_EXP;
    return {
        type,
        operator,
        left,
        right,
    };
}
function isDecimalDigit(ch) {
    return ch >= 48 && ch <= 57;
}
function isIdentifierStart(ch) {
    return ((ch === 36) || (ch === 95) ||
        (ch >= 65 && ch <= 90) ||
        (ch >= 97 && ch <= 122) || ch >= 128) && !binaryOps[String.fromCharCode(ch)];
}
function isIdentifierPart(ch) {
    return ((ch === 36) || (ch === 95) ||
        (ch >= 65 && ch <= 90) ||
        (ch >= 97 && ch <= 122) ||
        (ch >= 48 && ch <= 57) ||
        ch >= 128) && !binaryOps[String.fromCharCode(ch)];
}
class ParamsParser {
    constructor() {
        this.expr = '';
        this.index = 0;
        this.length = 0;
    }
    parse(expr) {
        this.expr = expr;
        this.index = 0;
        this.length = expr.length;
        const nodes = [];
        let chI;
        let node;
        while (this.index < this.length) {
            chI = this.exprICode(this.index);
            if (chI === SEMCOL_CODE || chI === COMMA_CODE) {
                this.index++;
            }
            else {
                node = this.parseExpression();
                if (node) {
                    nodes.push(node);
                }
                else if (this.index < this.length) {
                    throw new ParamError(`Unexpected "${this.exprI(this.index)}"`, this.index);
                }
            }
        }
        if (nodes.length === 1) {
            return nodes[0];
        }
        else {
            return {
                type: COMPOUND,
                body: nodes,
            };
        }
    }
    exprI(i) {
        return this.expr.charAt.call(this.expr, i);
    }
    exprICode(i) {
        return this.expr.charCodeAt.call(this.expr, i);
    }
    parseSpaces() {
        let ch = this.exprICode(this.index);
        while (ch === 32 || ch === 9 || ch === 10 || ch === 13) {
            ch = this.exprICode(++this.index);
        }
    }
    parseExpression() {
        const test = this.parseBinaryExpression();
        this.parseSpaces();
        return test;
    }
    parseBinaryOp() {
        this.parseSpaces();
        let toCheck = this.expr.substr(this.index, maxBinopLen);
        let tcLen = toCheck.length;
        while (tcLen > 0) {
            if (binaryOps.hasOwnProperty(toCheck)) {
                this.index += tcLen;
                return toCheck;
            }
            toCheck = toCheck.substr(0, --tcLen);
        }
        return null;
    }
    parseBinaryExpression() {
        let node;
        let biop;
        let prec;
        let stack;
        let biopInfo;
        let fbiop;
        let left;
        let right;
        let i;
        left = this.parseToken();
        biop = this.parseBinaryOp();
        if (!biop) {
            return left;
        }
        biopInfo = {
            value: biop,
            prec: binaryPrecedence(biop),
        };
        right = this.parseToken();
        if (!right || !left) {
            throw new ParamError(`Expected expression after ${biop}`, this.index);
        }
        stack = [left, biopInfo, right];
        while (true) {
            biop = this.parseBinaryOp();
            if (!biop) {
                break;
            }
            prec = binaryPrecedence(biop);
            if (prec === 0) {
                break;
            }
            biopInfo = { value: biop, prec };
            while (stack.length > 2) {
                fbiop = stack[stack.length - 2];
                if (!isIBiopInfo(fbiop) || prec > fbiop.prec) {
                    break;
                }
                right = stack.pop();
                stack.pop();
                left = stack.pop();
                if (!isIExpression(right) || !isIExpression(left)) {
                    break;
                }
                node = createBinaryExpression(fbiop.value, left, right);
                stack.push(node);
            }
            node = this.parseToken();
            if (!node) {
                throw new ParamError(`Expected expression after ${biop}`, this.index);
            }
            stack.push(biopInfo, node);
        }
        i = stack.length - 1;
        node = stack[i];
        while (i > 1) {
            fbiop = stack[i - 1];
            left = stack[i - 2];
            if (!isIBiopInfo(fbiop) || !isIExpression(left) || !isIExpression(node)) {
                throw new ParamError(`Expected expression`, this.index);
            }
            node = createBinaryExpression(fbiop.value, left, node);
            i -= 2;
        }
        if (!isIExpression(node)) {
            throw new ParamError(`Expected expression`, this.index);
        }
        return node;
    }
    parseToken() {
        let ch;
        let toCheck;
        let tcLen;
        this.parseSpaces();
        ch = this.exprICode(this.index);
        if (isDecimalDigit(ch) || ch === PERIOD_CODE) {
            return this.parseNumericLiteral();
        }
        else if (ch === SQUOTE_CODE || ch === DQUOTE_CODE) {
            return this.parseStringLiteral();
        }
        else if (isIdentifierStart(ch) || ch === OPAREN_CODE) {
            return this.parseVariable();
        }
        else if (ch === OBRACK_CODE) {
            return this.parseArray();
        }
        else {
            toCheck = this.expr.substr(this.index, maxUnopLen);
            tcLen = toCheck.length;
            while (tcLen > 0) {
                if (unaryOps.hasOwnProperty(toCheck)) {
                    this.index += tcLen;
                    return {
                        type: UNARY_EXP,
                        operator: toCheck,
                        argument: this.parseToken(),
                        prefix: true,
                    };
                }
                toCheck = toCheck.substr(0, --tcLen);
            }
            return null;
        }
    }
    parseNumericLiteral() {
        let rawName = '';
        let ch;
        let chCode;
        while (isDecimalDigit(this.exprICode(this.index))) {
            rawName += this.exprI(this.index++);
        }
        if (this.exprICode(this.index) === PERIOD_CODE) {
            rawName += this.exprI(this.index++);
            while (isDecimalDigit(this.exprICode(this.index))) {
                rawName += this.exprI(this.index++);
            }
        }
        ch = this.exprI(this.index);
        if (ch === 'e' || ch === 'E') {
            rawName += this.exprI(this.index++);
            ch = this.exprI(this.index);
            if (ch === '+' || ch === '-') {
                rawName += this.exprI(this.index++);
            }
            while (isDecimalDigit(this.exprICode(this.index))) {
                rawName += this.exprI(this.index++);
            }
            if (!isDecimalDigit(this.exprICode(this.index - 1))) {
                throw new ParamError(`Expected exponent (${rawName}${this.exprI(this.index)})`, this.index);
            }
        }
        chCode = this.exprICode(this.index);
        if (isIdentifierStart(chCode)) {
            throw new ParamError(`Variable names cannot start with a number (${rawName}${this.exprI(this.index)})`, this.index);
        }
        else if (chCode === PERIOD_CODE) {
            throw new ParamError('Unexpected period', this.index);
        }
        return {
            type: LITERAL,
            value: parseFloat(rawName),
            raw: rawName,
        };
    }
    parseStringLiteral() {
        let str = '';
        const quote = this.exprI(this.index++);
        let closed = false;
        let ch;
        while (this.index < this.length) {
            ch = this.exprI(this.index++);
            if (ch === quote) {
                closed = true;
                break;
            }
            else if (ch === '\\') {
                ch = this.exprI(this.index++);
                switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;
                    default: str += `\\${ch}`;
                }
            }
            else {
                str += ch;
            }
        }
        if (!closed) {
            throw new ParamError(`Unclosed quote after "${str}"`, this.index);
        }
        return {
            type: LITERAL,
            value: str,
            raw: quote + str + quote,
        };
    }
    parseIdentifier() {
        let ch = this.exprICode(this.index);
        const start = this.index;
        let identifier;
        if (isIdentifierStart(ch)) {
            this.index++;
        }
        else {
            throw new ParamError(`Unexpected ${this.exprI(this.index)}`, this.index);
        }
        while (this.index < this.length) {
            ch = this.exprICode(this.index);
            if (isIdentifierPart(ch)) {
                this.index++;
            }
            else {
                break;
            }
        }
        identifier = this.expr.slice(start, this.index);
        if (literals.hasOwnProperty(identifier)) {
            return {
                type: LITERAL,
                value: literals[identifier],
                raw: identifier,
            };
        }
        else {
            return {
                type: IDENTIFIER,
                name: identifier,
            };
        }
    }
    parseArguments(termination) {
        let chI;
        const args = [];
        let node;
        let closed = false;
        while (this.index < this.length) {
            this.parseSpaces();
            chI = this.exprICode(this.index);
            if (chI === termination) {
                closed = true;
                this.index++;
                break;
            }
            else if (chI === COMMA_CODE) {
                this.index++;
            }
            else {
                node = this.parseExpression();
                if (!node || node.type === COMPOUND) {
                    throw new ParamError('Expected comma', this.index);
                }
                args.push(node);
            }
        }
        if (!closed) {
            throw new ParamError(`Expected ${String.fromCharCode(termination)}`, this.index);
        }
        return args;
    }
    parseVariable() {
        let chI;
        chI = this.exprICode(this.index);
        let node = chI === OPAREN_CODE
            ? this.parseGroup()
            : this.parseIdentifier();
        this.parseSpaces();
        chI = this.exprICode(this.index);
        while (chI === PERIOD_CODE || chI === OBRACK_CODE || chI === OPAREN_CODE) {
            this.index++;
            if (chI === PERIOD_CODE) {
                this.parseSpaces();
                node = {
                    type: MEMBER_EXP,
                    computed: false,
                    object: node,
                    property: this.parseIdentifier(),
                };
            }
            else if (chI === OBRACK_CODE) {
                node = {
                    type: MEMBER_EXP,
                    computed: true,
                    object: node,
                    property: this.parseExpression(),
                };
                this.parseSpaces();
                chI = this.exprICode(this.index);
                if (chI !== CBRACK_CODE) {
                    throw new ParamError('Unclosed [', this.index);
                }
                this.index++;
            }
            else if (chI === OPAREN_CODE) {
                node = {
                    type: CALL_EXP,
                    arguments: this.parseArguments(CPAREN_CODE),
                    callee: node,
                };
            }
            this.parseSpaces();
            chI = this.exprICode(this.index);
        }
        return node;
    }
    parseGroup() {
        this.index++;
        const node = this.parseExpression();
        this.parseSpaces();
        if (this.exprICode(this.index) === CPAREN_CODE) {
            this.index++;
            return node;
        }
        else {
            throw new ParamError('Unclosed (', this.index);
        }
    }
    parseArray() {
        this.index++;
        return {
            type: ARRAY_EXP,
            elements: this.parseArguments(CBRACK_CODE),
        };
    }
}

function newDirective(token) {
    switch (token.type) {
        case EType.if:
        case EType.elseif:
            return new IfCondtion(token.type, parseParams(token), token.startPos, token.endPos);
        case EType.list:
            return new List(token.type, parseParams(token), token.startPos, token.endPos);
        case EType.include:
            return new Include(token.type, parseParams(token), token.startPos, token.endPos);
    }
    return new UnknownDirective(token.type, parseParams(token), token.startPos, token.endPos);
}
function parseParams(token) {
    const parser = new ParamsParser();
    const params = [];
    for (const param of token.params) {
        console.log(`parseParams: \`${param}\``);
        params.push(parser.parse(param));
    }
    return params;
}
function newNode(token) {
    switch (token.nodeType) {
        case ENodeType.Directive:
            return newDirective(token);
        case ENodeType.Macro:
            return new Macro(token.tag, parseParams(token), token.startPos, token.endPos);
        case ENodeType.Interpolation:
            return new Interpolation(token.startPos, token.endPos, parseParams(token));
        case ENodeType.Text:
            return new Text(token.text, token.startPos, token.endPos);
    }
    throw new ParserError('Unknown symbol');
}
function createNode(token) {
    const node = newNode(token);
    if (node.$config.disallowParams && token.params.length > 0) {
        throw new ParserError(`Params are not allowed in \`${node.$eType}\``);
    }
    return node;
}
//# sourceMappingURL=NodeHelper.js.map

class Program extends BaseNode {
    constructor(start, end) {
        super(ENodeType.Program, start, end, EType.Program);
        this.children = [];
    }
    addChild(node) {
        this.children.push(node);
        return this;
    }
}
//# sourceMappingURL=Program.js.map

const symbols = [
    { startToken: '</#', endToken: '>', type: ENodeType.Directive, end: true },
    { startToken: '<#', endToken: '>', type: ENodeType.Directive, end: false },
    { startToken: '</@', endToken: '>', type: ENodeType.Macro, end: true },
    { startToken: '<@', endToken: '>', type: ENodeType.Macro, end: false },
    { startToken: '${', endToken: '}', type: ENodeType.Interpolation, end: false },
];
const whitespaces = [
    ' ',
    '\t',
    '\n',
    '\r',
];
//# sourceMappingURL=Symbols.js.map

class Token {
    constructor(symbol, startPos, endPos, type = EType.Text, params = [], tag = '', isClose = false, text = '') {
        this.nodeType = symbol;
        this.startPos = startPos;
        this.endPos = endPos;
        this.type = type;
        this.params = params;
        this.tag = tag;
        this.isClose = isClose;
        this.text = text;
    }
}
//# sourceMappingURL=Token.js.map

class Tokenizer {
    constructor() {
        this.template = '';
        this.tokens = [];
        this.cursorPos = 0;
    }
    parse(template) {
        this.template = template;
        while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
            const token = this.parseToken();
            if (!token) {
                this.tokens.push(this.makeToken(ENodeType.Text, this.cursorPos, this.template.length));
                break;
            }
        }
        return this.tokens;
    }
    makeToken(symbol, startPos, endPos, type = EType.Text, params = [], tag = '', isClose = false) {
        return new Token(symbol, startPos, endPos, type, params, tag, isClose, type !== EType.Text ? '' : this.template.substring(startPos, endPos));
    }
    getNextPos(items) {
        let pos = -1;
        for (const item of items) {
            const n = this.template.indexOf(item, this.cursorPos);
            if (n >= 0 && (pos === -1 || n < pos)) {
                pos = n;
            }
        }
        return pos;
    }
    parseTag(endTag) {
        const pos = this.getNextPos([
            ...whitespaces,
            endTag,
        ]);
        if (pos < 0) {
            throw new ParserError('Missing closing tag');
        }
        return this.template.substring(this.cursorPos, pos);
    }
    parseToken() {
        let symbol = null;
        let startPos = 0;
        for (const item of symbols) {
            const n = this.template.indexOf(item.startToken, this.cursorPos);
            if (n >= 0 && (!symbol || n < startPos)) {
                symbol = item,
                    startPos = n;
            }
        }
        if (!symbol) {
            return false;
        }
        if (startPos - 1 > this.cursorPos) {
            this.tokens.push(this.makeToken(ENodeType.Text, this.cursorPos, startPos - 1));
        }
        this.cursorPos = startPos;
        this.cursorPos += symbol.startToken.length;
        let node = null;
        switch (symbol.type) {
            case ENodeType.Directive:
                node = this.parseDirective(symbol, startPos, symbol.end);
                break;
            case ENodeType.Macro:
                node = this.parseMacro(symbol, startPos, symbol.end);
                break;
            case ENodeType.Interpolation:
                node = this.parseInterpolation(symbol, startPos);
                break;
            default:
                break;
        }
        if (node) {
            this.tokens.push(node);
        }
        ++this.cursorPos;
        return true;
    }
    parseInterpolation(symbol, startPos) {
        const params = this.parseParams(symbol.endToken);
        const node = this.makeToken(ENodeType.Interpolation, startPos, this.cursorPos, EType.Interpolation, params);
        return node;
    }
    parseMacro(symbol, startPos, isClose = false) {
        const typeString = this.parseTag(symbol.endToken);
        this.cursorPos += typeString.length;
        const params = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken);
        const node = this.makeToken(ENodeType.Macro, startPos, this.cursorPos, EType.MacroCall, params, typeString, isClose);
        return node;
    }
    parseDirective(symbol, startPos, isClose = false) {
        const typeString = this.parseTag(symbol.endToken);
        if (!(typeString in EType)) {
            throw new ParserError(`Unsupported directive ${typeString}`);
        }
        this.cursorPos += typeString.length;
        const params = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken);
        const node = this.makeToken(ENodeType.Directive, startPos, this.cursorPos, typeString, params, '', isClose);
        return node;
    }
    isWhitespace(char) {
        return char === ' ' || char === '\t' || char === '\r' || char === '\n';
    }
    parseParams(engTag) {
        const text = this.template.substring(this.cursorPos);
        const params = [];
        let paramText = '';
        let paramPos = this.cursorPos;
        let bracketLevel = 0;
        let inString = false;
        for (const char of text) {
            if (char === '"') {
                inString = !inString;
            }
            if (!inString) {
                if (char === '(') {
                    ++bracketLevel;
                }
                else if (char === ')') {
                    --bracketLevel;
                }
            }
            if (bracketLevel < 0) {
                throw new ParserError(`bracketLevel < 0`);
            }
            if (bracketLevel === 0 && !inString) {
                if (char === engTag) {
                    if (paramText !== '') {
                        params.push(paramText);
                        paramText = '';
                    }
                    this.cursorPos = paramPos + engTag.length;
                    return params;
                }
                else if (this.isWhitespace(char)) {
                    if (paramText !== '') {
                        params.push(paramText);
                        paramText = '';
                    }
                    ++paramPos;
                    this.cursorPos = paramPos;
                }
                else {
                    paramText += char;
                    ++paramPos;
                }
            }
            else {
                paramText += char;
                ++paramPos;
            }
        }
        throw new ParserError(`Unclosed directive or macro`);
    }
}
//# sourceMappingURL=Tokenizer.js.map

class Parser {
    constructor() {
        this.template = '';
        this.template = '';
        this.tokens = [];
    }
    parse(template) {
        this.template = template;
        this.AST = new Program(0, template.length);
        this.build();
        return this.deepClone(this.AST);
    }
    deepClone(text) {
        const cache = [];
        const json = JSON.stringify(text, (key, value) => {
            if (key.startsWith('$')) {
                return;
            }
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    return;
                }
                cache.push(value);
            }
            return value;
        }, 2);
        return JSON.parse(json);
    }
    build() {
        const stack = [];
        let parent = this.AST;
        let node = null;
        const tokenizer = new Tokenizer();
        this.tokens = tokenizer.parse(this.template);
        for (const token of this.tokens) {
            node = createNode(token);
            this.canContain(node, parent);
            if (node.$config.isSelfClosing) {
                if (token.isClose) {
                    throw new NodeError(`Unexpected close tag`, node);
                }
                parent = parent.addChild(node);
            }
            else if (token.isClose) {
                let parentNode = parent;
                while (parentNode) {
                    if (parentNode.$nodeType === token.nodeType) {
                        parentNode = stack.pop();
                        break;
                    }
                    if (!parentNode.$config.isSelfClosing) {
                        throw new NodeError(`Missing close tag`, parentNode);
                    }
                    parentNode = stack.pop();
                }
                if (!parentNode) {
                    throw new NodeError(`Closing tag is not alowed`, node);
                }
                parent = parentNode;
            }
            else {
                parent = parent.addChild(node);
                stack.push(parent);
                parent = node;
            }
        }
        if (stack.length > 0) {
            throw new NodeError(`Unclosed tag`, parent);
        }
    }
    canContain(node, parent) {
        if (!node.canAddTo(parent)) {
            throw new NodeError(`${this.debugNode(node.$eType)} require one of parents ${this.debugNode(node.$config.onlyIn)} but found in ${this.debugNode(parent.$eType)}`, node);
        }
    }
    debugNode(data) {
        if (!data) {
            return '[?]';
        }
        if (data instanceof Array) {
            return `[\`${data.map((it) => `${it}`).join(', ')}\`]`;
        }
        return `\`${data}\``;
    }
}
//# sourceMappingURL=Parser.js.map

//# sourceMappingURL=index.js.map

exports.Parser = Parser;
//# sourceMappingURL=index.js.map
