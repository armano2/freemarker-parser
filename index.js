'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class ParserError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, ParserError.prototype);
    }
}

class NodeError extends ParserError {
    constructor(m, el) {
        m = `${el.type}(${el.start}-${el.end}) - ${m}`;
        super(m);
        this.el = el;
    }
}

var ENodeType;
(function (ENodeType) {
    ENodeType[ENodeType["Program"] = 0] = "Program";
    ENodeType[ENodeType["Directive"] = 1] = "Directive";
    ENodeType[ENodeType["Macro"] = 2] = "Macro";
    ENodeType[ENodeType["Text"] = 3] = "Text";
    ENodeType[ENodeType["Interpolation"] = 4] = "Interpolation";
})(ENodeType || (ENodeType = {}));
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
function isWhitespace(char) {
    for (const space of whitespaces) {
        if (char === space) {
            return true;
        }
    }
    return false;
}

var NodeNames;
(function (NodeNames) {
    NodeNames["Program"] = "Program";
    NodeNames["Else"] = "Else";
    NodeNames["Condition"] = "Condition";
    NodeNames["Include"] = "Include";
    NodeNames["List"] = "List";
    NodeNames["Text"] = "Text";
    NodeNames["Assign"] = "Assign";
    NodeNames["Global"] = "Global";
    NodeNames["Local"] = "Local";
    NodeNames["Macro"] = "Macro";
    NodeNames["MacroCall"] = "MacroCall";
    NodeNames["Interpolation"] = "Interpolation";
    NodeNames["Attempt"] = "Attempt";
    NodeNames["Recover"] = "Recover";
    NodeNames["ConditionElse"] = "ConditionElse";
})(NodeNames || (NodeNames = {}));

class ParamError extends ParserError {
    constructor(message, index) {
        super(`${message} at character ${index}`);
        this.description = message;
        this.index = index;
    }
}

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

function parseParams(tokenParams) {
    const parser = new ParamsParser();
    const params = [];
    for (const param of tokenParams) {
        params.push(parser.parse(param));
    }
    return params;
}

const directives = {
    if: NodeNames.Condition,
    else: NodeNames.Else,
    elseif: NodeNames.ConditionElse,
    list: NodeNames.List,
    include: NodeNames.Include,
    assign: NodeNames.Assign,
    attempt: NodeNames.Attempt,
    global: NodeNames.Global,
    local: NodeNames.Local,
    macro: NodeNames.Macro,
    recover: NodeNames.Recover,
};
function cToken(type, start, end, text, params = [], isClose = false) {
    return {
        type,
        start,
        end,
        params: parseParams(params),
        text,
        isClose,
    };
}

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
                this.tokens.push(this.parseText(this.cursorPos, this.template.length));
                break;
            }
        }
        return this.tokens;
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
            this.tokens.push(this.parseText(this.cursorPos, startPos - 1));
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
    parseText(start, end) {
        return cToken(ENodeType.Text, start, end, this.template.substring(start, end));
    }
    parseInterpolation(symbol, start) {
        const params = this.parseParams(symbol.endToken);
        return cToken(ENodeType.Interpolation, start, this.cursorPos, '', params);
    }
    parseMacro(symbol, start, isClose = false) {
        const typeString = this.parseTag(symbol.endToken);
        this.cursorPos += typeString.length;
        const params = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken);
        return cToken(ENodeType.Macro, start, this.cursorPos, typeString, params, isClose);
    }
    parseDirective(symbol, startPos, isClose = false) {
        const typeString = this.parseTag(symbol.endToken);
        this.cursorPos += typeString.length;
        const params = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken);
        return cToken(ENodeType.Directive, startPos, this.cursorPos, typeString, params, isClose);
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
                else if (isWhitespace(char)) {
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

function cAssign(params, start, end) {
    return { type: NodeNames.Assign, params, start, end };
}
function cGlobal(params, start, end) {
    return { type: NodeNames.Global, params, start, end };
}
function cCondition(params, start, end) {
    return { type: NodeNames.Condition, params, consequent: [], start, end };
}
function cElse(start, end) {
    return { type: NodeNames.Else, body: [], start, end };
}
function cList(params, start, end) {
    return { type: NodeNames.List, params, body: [], start, end };
}
function cMacro(params, start, end) {
    return { type: NodeNames.Macro, params, body: [], start, end };
}
function cProgram(start, end) {
    return { type: NodeNames.Program, body: [], start, end };
}
function cMacroCall(params, name, start, end) {
    return { type: NodeNames.MacroCall, name, params, body: [], start, end };
}
function cText(text, start, end) {
    return { type: NodeNames.Text, text, start, end };
}
function cInclude(params, start, end) {
    return { type: NodeNames.Include, params, start, end };
}
function cInterpolation(params, start, end) {
    return { type: NodeNames.Interpolation, params, start, end };
}
function cLocal(params, start, end) {
    return { type: NodeNames.Local, params, start, end };
}
function cRecover(start, end) {
    return { type: NodeNames.Recover, body: [], start, end };
}
function cAttempt(start, end) {
    return { type: NodeNames.Attempt, body: [], start, end };
}

function addToNode(parent, child) {
    switch (parent.type) {
        case NodeNames.Condition:
            parent.consequent.push(child);
            break;
        case NodeNames.List:
        case NodeNames.Else:
        case NodeNames.Macro:
        case NodeNames.Program:
        case NodeNames.Attempt:
        case NodeNames.Recover:
            parent.body.push(child);
            break;
        case NodeNames.MacroCall:
        case NodeNames.Assign:
        case NodeNames.Global:
        case NodeNames.Local:
            throw new ParserError(`addToChild(${parent.type}, ${child.type}) failed`);
        case NodeNames.Interpolation:
        case NodeNames.Include:
        case NodeNames.Text:
        default:
            throw new ParserError(`addToChild(${parent.type}, ${child.type}) failed`);
    }
    return child;
}
function tokenToNodeType(token) {
    switch (token.type) {
        case ENodeType.Directive:
            if (token.text in directives) {
                return directives[token.text];
            }
            throw new ParserError(`Directive \`${token.text}\` is not supported`);
        case ENodeType.Interpolation:
            return NodeNames.Interpolation;
        case ENodeType.Text:
            return NodeNames.Text;
        case ENodeType.Macro:
            return NodeNames.Macro;
        case ENodeType.Program:
            return NodeNames.Program;
    }
    throw new ParserError(`Unknow token \`${token.type}\` - \`${token.text}\``);
}
function addNodeChild(parent, token) {
    const tokenType = tokenToNodeType(token);
    console.log(`addNodeChild(${parent.type}, ${tokenType})`);
    switch (tokenType) {
        case NodeNames.Else:
            if (parent.type === NodeNames.Condition) {
                return parent.alternate = cElse(token.start, token.end);
            }
            else if (parent.type === NodeNames.List) {
                return parent.fallback = cElse(token.start, token.end);
            }
            break;
        case NodeNames.ConditionElse:
            if (parent.type === NodeNames.Condition) {
                return parent.alternate = cCondition(token.params, token.start, token.end);
            }
            break;
        case NodeNames.Recover:
            if (parent.type === NodeNames.Attempt) {
                return parent.fallback = cRecover(token.start, token.end);
            }
            break;
        case NodeNames.Attempt:
            return addToNode(parent, cAttempt(token.start, token.end));
        case NodeNames.Condition:
            return addToNode(parent, cCondition(token.params, token.start, token.end));
        case NodeNames.List:
            return addToNode(parent, cList(token.params, token.start, token.end));
        case NodeNames.Global:
            return addToNode(parent, cGlobal(token.params, token.start, token.end));
        case NodeNames.Macro:
            return addToNode(parent, cMacro(token.params, token.start, token.end));
        case NodeNames.Assign:
            return addToNode(parent, cAssign(token.params, token.start, token.end));
        case NodeNames.Include:
            return addToNode(parent, cInclude(token.params, token.start, token.end));
        case NodeNames.Local:
            return addToNode(parent, cLocal(token.params, token.start, token.end));
        case NodeNames.Interpolation:
            return addToNode(parent, cInterpolation(token.params, token.start, token.end));
        case NodeNames.Text:
            return addToNode(parent, cText(token.text, token.start, token.end));
        case NodeNames.Macro:
            return addToNode(parent, cMacroCall(token.params, token.text, token.start, token.end));
        case NodeNames.Program:
    }
    throw new ParserError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`);
}
function isSelfClosing(type) {
    switch (type) {
        case NodeNames.Program:
        case NodeNames.Condition:
        case NodeNames.List:
        case NodeNames.Attempt:
        case NodeNames.Macro:
            return false;
        case NodeNames.MacroCall:
            return true;
        case NodeNames.Assign:
        case NodeNames.Global:
        case NodeNames.Local:
            return true;
        case NodeNames.Else:
        case NodeNames.ConditionElse:
        case NodeNames.Include:
        case NodeNames.Text:
        case NodeNames.Interpolation:
        case NodeNames.Recover:
            return true;
    }
    throw new ParserError(`isSelfClosing(${type}) failed`);
}

class Parser {
    parse(template) {
        const astRoot = cProgram(0, template.length);
        const stack = [];
        let parent = astRoot;
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.parse(template);
        for (const token of tokens) {
            const tokenType = tokenToNodeType(token);
            if (isSelfClosing(tokenType)) {
                if (token.isClose) {
                    throw new NodeError(`Unexpected close tag`, token);
                }
                addNodeChild(parent, token);
            }
            else if (token.isClose) {
                let parentNode = parent;
                while (parentNode) {
                    if (parentNode.type === tokenType) {
                        parentNode = stack.pop();
                        break;
                    }
                    if (!isSelfClosing(parentNode.type)) {
                        throw new NodeError(`Missing close tag ${tokenType}`, parentNode);
                    }
                    parentNode = stack.pop();
                }
                if (!parentNode) {
                    throw new NodeError(`Unexpected close tag`, token);
                }
                parent = parentNode;
            }
            else {
                stack.push(parent);
                parent = addNodeChild(parent, token);
            }
        }
        if (stack.length > 0) {
            throw new ParserError(`Unclosed tag`);
        }
        return astRoot;
    }
}

exports.Parser = Parser;
//# sourceMappingURL=index.js.map
