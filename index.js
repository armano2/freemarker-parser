'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var util = require('util');

class NodeError extends Error {
    constructor(m, el) {
        super(m);
        if (el) {
            this.nodeType = el.type;
            this.start = el.start;
            this.end = el.end;
        }
        Object.setPrototypeOf(this, NodeError.prototype);
    }
}

class ParamError extends SyntaxError {
    constructor(message, index) {
        super(`${message} at character ${index}`);
        this.description = message;
        this.index = index;
        Object.setPrototypeOf(this, ParamError.prototype);
    }
}

var ENodeType;
(function (ENodeType) {
    ENodeType["Program"] = "Program";
    ENodeType["Directive"] = "Directive";
    ENodeType["Macro"] = "Macro";
    ENodeType["Text"] = "Text";
    ENodeType["Interpolation"] = "Interpolation";
    ENodeType["Comment"] = "Comment";
})(ENodeType || (ENodeType = {}));
const symbols = [
    { startToken: '<#--', endToken: ['-->'], type: ENodeType.Comment, end: false },
    { startToken: '</#', endToken: ['>', '/>'], type: ENodeType.Directive, end: true },
    { startToken: '<#', endToken: ['>', '/>'], type: ENodeType.Directive, end: false },
    { startToken: '</@', endToken: ['>', '/>'], type: ENodeType.Macro, end: true },
    { startToken: '<@', endToken: ['>', '/>'], type: ENodeType.Macro, end: false },
    { startToken: '${', endToken: ['}'], type: ENodeType.Interpolation, end: false },
];

var ECharCodes;
(function (ECharCodes) {
    ECharCodes[ECharCodes["TAB"] = 9] = "TAB";
    ECharCodes[ECharCodes["LINE_FEED"] = 10] = "LINE_FEED";
    ECharCodes[ECharCodes["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
    ECharCodes[ECharCodes["SPACE"] = 32] = "SPACE";
    ECharCodes[ECharCodes["HASH"] = 35] = "HASH";
    ECharCodes[ECharCodes["DOLAR"] = 36] = "DOLAR";
    ECharCodes[ECharCodes["PERIOD_CODE"] = 46] = "PERIOD_CODE";
    ECharCodes[ECharCodes["SLASH"] = 47] = "SLASH";
    ECharCodes[ECharCodes["COMMA_CODE"] = 44] = "COMMA_CODE";
    ECharCodes[ECharCodes["HYPHEN"] = 45] = "HYPHEN";
    ECharCodes[ECharCodes["SQUOTE_CODE"] = 39] = "SQUOTE_CODE";
    ECharCodes[ECharCodes["DQUOTE_CODE"] = 34] = "DQUOTE_CODE";
    ECharCodes[ECharCodes["OPAREN_CODE"] = 40] = "OPAREN_CODE";
    ECharCodes[ECharCodes["CPAREN_CODE"] = 41] = "CPAREN_CODE";
    ECharCodes[ECharCodes["OBRACK_CODE"] = 91] = "OBRACK_CODE";
    ECharCodes[ECharCodes["CBRACK_CODE"] = 93] = "CBRACK_CODE";
    ECharCodes[ECharCodes["SEMCOL_CODE"] = 59] = "SEMCOL_CODE";
    ECharCodes[ECharCodes["LESS_THAN"] = 60] = "LESS_THAN";
    ECharCodes[ECharCodes["GREATER_THAN"] = 62] = "GREATER_THAN";
    ECharCodes[ECharCodes["AT_SYMBOL"] = 64] = "AT_SYMBOL";
    ECharCodes[ECharCodes["OBRACE_CODE"] = 123] = "OBRACE_CODE";
    ECharCodes[ECharCodes["CBRACE_CODE"] = 125] = "CBRACE_CODE";
})(ECharCodes || (ECharCodes = {}));
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
function isDecimalDigit(ch) {
    return ch >= 48 && ch <= 57;
}
function isLetter(ch) {
    return (ch >= 65 && ch <= 90) ||
        (ch >= 97 && ch <= 122);
}
function isWhitespace(ch) {
    return ch === ECharCodes.SPACE || ch === ECharCodes.TAB || ch === ECharCodes.CARRIAGE_RETURN || ch === ECharCodes.LINE_FEED;
}
function isIdentifierStart(ch) {
    return (isLetter(ch) ||
        (ch === 36) || (ch === 95) ||
        ch >= 128) && !binaryOps[String.fromCharCode(ch)];
}
function isIdentifierPart(ch) {
    return (isLetter(ch) ||
        isDecimalDigit(ch) ||
        (ch === 36) || (ch === 95) ||
        ch >= 128) && !binaryOps[String.fromCharCode(ch)];
}
const unaryOps = {
    '-': true,
    '!': true,
    '~': true,
    '+': true,
    '?': true,
    '=': true,
    '+=': true,
    '-=': true,
    '*=': true,
    '/=': true,
    '%=': true,
    '--': true,
    '++': true,
};
function getMaxKeyLen(obj) {
    let maxLen = 0;
    let len;
    for (const key of Object.keys(obj)) {
        len = key.length;
        if (len > maxLen) {
            maxLen = len;
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

var ParamNames;
(function (ParamNames) {
    ParamNames["Empty"] = "Empty";
    ParamNames["Compound"] = "Compound";
    ParamNames["Identifier"] = "Identifier";
    ParamNames["MemberExpression"] = "MemberExpression";
    ParamNames["Literal"] = "Literal";
    ParamNames["CallExpression"] = "CallExpression";
    ParamNames["UnaryExpression"] = "UnaryExpression";
    ParamNames["BinaryExpression"] = "BinaryExpression";
    ParamNames["LogicalExpression"] = "LogicalExpression";
    ParamNames["ArrayExpression"] = "ArrayExpression";
})(ParamNames || (ParamNames = {}));

function isIBiopInfo(object) {
    return object && 'prec' in object;
}
function isAllParamTypes(object) {
    return object && 'type' in object;
}
const binaryPrecedence = (opVal) => binaryOps[opVal] || 0;
function createBinaryExpression(operator, left, right) {
    if (operator === '||' || operator === '&&') {
        return { type: ParamNames.LogicalExpression, operator, left, right };
    }
    else {
        return { type: ParamNames.BinaryExpression, operator, left, right };
    }
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
            chI = this.charCodeAt(this.index);
            if (chI === ECharCodes.SEMCOL_CODE || chI === ECharCodes.COMMA_CODE) {
                this.index++;
            }
            else {
                node = this.parseExpression();
                if (node) {
                    nodes.push(node);
                }
                else if (this.index < this.length) {
                    throw new ParamError(`Unexpected "${this.charAt(this.index)}"`, this.index);
                }
            }
        }
        if (nodes.length === 1) {
            return nodes[0];
        }
        else {
            return {
                type: ParamNames.Compound,
                body: nodes,
            };
        }
    }
    charAt(i) {
        return this.expr.charAt(i);
    }
    charCodeAt(i) {
        return this.expr.charCodeAt(i);
    }
    parseSpaces() {
        let ch = this.charCodeAt(this.index);
        while (isWhitespace(ch)) {
            ch = this.charCodeAt(++this.index);
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
                if (!isAllParamTypes(right) || !isAllParamTypes(left)) {
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
            if (!isIBiopInfo(fbiop) || !isAllParamTypes(left) || !isAllParamTypes(node)) {
                throw new ParamError(`Expected expression`, this.index);
            }
            node = createBinaryExpression(fbiop.value, left, node);
            i -= 2;
        }
        if (!isAllParamTypes(node)) {
            throw new ParamError(`Expected expression`, this.index);
        }
        return node;
    }
    parseToken() {
        let ch;
        let toCheck;
        let tcLen;
        this.parseSpaces();
        ch = this.charCodeAt(this.index);
        if (isDecimalDigit(ch) || ch === ECharCodes.PERIOD_CODE) {
            return this.parseNumericLiteral();
        }
        else if (ch === ECharCodes.SQUOTE_CODE || ch === ECharCodes.DQUOTE_CODE) {
            return this.parseStringLiteral();
        }
        else if (isIdentifierStart(ch) || ch === ECharCodes.OPAREN_CODE) {
            return this.parseVariable();
        }
        else if (ch === ECharCodes.OBRACK_CODE) {
            return this.parseArray();
        }
        else {
            toCheck = this.expr.substr(this.index, maxUnopLen);
            tcLen = toCheck.length;
            while (tcLen > 0) {
                if (unaryOps.hasOwnProperty(toCheck)) {
                    this.index += tcLen;
                    return {
                        type: ParamNames.UnaryExpression,
                        operator: toCheck,
                        argument: this.parseToken(),
                        prefix: true,
                    };
                }
                toCheck = toCheck.substr(0, --tcLen);
            }
        }
        return null;
    }
    parseNumericLiteral() {
        let rawName = '';
        let ch;
        let chCode;
        while (isDecimalDigit(this.charCodeAt(this.index))) {
            rawName += this.charAt(this.index++);
        }
        if (this.charCodeAt(this.index) === ECharCodes.PERIOD_CODE) {
            rawName += this.charAt(this.index++);
            while (isDecimalDigit(this.charCodeAt(this.index))) {
                rawName += this.charAt(this.index++);
            }
        }
        ch = this.charAt(this.index);
        if (ch === 'e' || ch === 'E') {
            rawName += this.charAt(this.index++);
            ch = this.charAt(this.index);
            if (ch === '+' || ch === '-') {
                rawName += this.charAt(this.index++);
            }
            while (isDecimalDigit(this.charCodeAt(this.index))) {
                rawName += this.charAt(this.index++);
            }
            if (!isDecimalDigit(this.charCodeAt(this.index - 1))) {
                throw new ParamError(`Expected exponent (${rawName}${this.charAt(this.index)})`, this.index);
            }
        }
        chCode = this.charCodeAt(this.index);
        if (isIdentifierStart(chCode)) {
            throw new ParamError(`Variable names cannot start with a number (${rawName}${this.charAt(this.index)})`, this.index);
        }
        else if (chCode === ECharCodes.PERIOD_CODE) {
            throw new ParamError('Unexpected period', this.index);
        }
        return {
            type: ParamNames.Literal,
            value: parseFloat(rawName),
            raw: rawName,
        };
    }
    parseStringLiteral() {
        let str = '';
        const quote = this.charAt(this.index++);
        let closed = false;
        let ch;
        while (this.index < this.length) {
            ch = this.charAt(this.index++);
            if (ch === quote) {
                closed = true;
                break;
            }
            else if (ch === '\\') {
                ch = this.charAt(this.index++);
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
            type: ParamNames.Literal,
            value: str,
            raw: quote + str + quote,
        };
    }
    parseIdentifier() {
        let ch = this.charCodeAt(this.index);
        const start = this.index;
        let identifier;
        if (isIdentifierStart(ch)) {
            this.index++;
        }
        else {
            throw new ParamError(`Unexpected ${this.charAt(this.index)}`, this.index);
        }
        while (this.index < this.length) {
            ch = this.charCodeAt(this.index);
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
                type: ParamNames.Literal,
                value: literals[identifier],
                raw: identifier,
            };
        }
        else {
            return {
                type: ParamNames.Identifier,
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
            chI = this.charCodeAt(this.index);
            if (chI === termination) {
                closed = true;
                this.index++;
                break;
            }
            else if (chI === ECharCodes.COMMA_CODE) {
                this.index++;
            }
            else {
                node = this.parseExpression();
                if (!node || node.type === ParamNames.Compound) {
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
        chI = this.charCodeAt(this.index);
        let node = chI === ECharCodes.OPAREN_CODE
            ? this.parseGroup()
            : this.parseIdentifier();
        this.parseSpaces();
        chI = this.charCodeAt(this.index);
        while (chI === ECharCodes.PERIOD_CODE || chI === ECharCodes.OBRACK_CODE || chI === ECharCodes.OPAREN_CODE) {
            this.index++;
            if (chI === ECharCodes.PERIOD_CODE) {
                this.parseSpaces();
                node = {
                    type: ParamNames.MemberExpression,
                    computed: false,
                    object: node,
                    property: this.parseIdentifier(),
                };
            }
            else if (chI === ECharCodes.OBRACK_CODE) {
                node = {
                    type: ParamNames.MemberExpression,
                    computed: true,
                    object: node,
                    property: this.parseExpression(),
                };
                this.parseSpaces();
                chI = this.charCodeAt(this.index);
                if (chI !== ECharCodes.CBRACK_CODE) {
                    throw new ParamError('Unclosed [', this.index);
                }
                this.index++;
            }
            else if (chI === ECharCodes.OPAREN_CODE) {
                node = {
                    type: ParamNames.CallExpression,
                    arguments: this.parseArguments(ECharCodes.CPAREN_CODE),
                    callee: node,
                };
            }
            this.parseSpaces();
            chI = this.charCodeAt(this.index);
        }
        return node;
    }
    parseGroup() {
        this.index++;
        const node = this.parseExpression();
        this.parseSpaces();
        if (this.charCodeAt(this.index) === ECharCodes.CPAREN_CODE) {
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
            type: ParamNames.ArrayExpression,
            elements: this.parseArguments(ECharCodes.CBRACK_CODE),
        };
    }
}

function cToken(type, start, end, text, params = '', isClose = false) {
    const parser = new ParamsParser();
    return {
        type,
        start,
        end,
        text,
        params: params !== '' ? parser.parse(params) : {
            type: ParamNames.Empty,
        },
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
        this.tokens = [];
        this.cursorPos = 0;
        while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
            this.parseToken();
        }
        return this.tokens;
    }
    getNextPos(items) {
        let pos = -1;
        let text = '';
        for (const item of items) {
            const n = this.template.indexOf(item, this.cursorPos);
            if (n >= 0 && (pos === -1 || n < pos)) {
                pos = n;
                text = item;
            }
        }
        return { pos, text };
    }
    parseTag() {
        let text = '';
        let ch = this.charCodeAt(this.cursorPos);
        while (this.cursorPos < this.template.length) {
            if (isWhitespace(ch) ||
                ch === ECharCodes.GREATER_THAN ||
                (ch === ECharCodes.SLASH && this.charCodeAt(this.cursorPos + 1) === ECharCodes.GREATER_THAN)) {
                break;
            }
            if (isLetter(ch) || ch === ECharCodes.PERIOD_CODE) {
                text += this.charAt(this.cursorPos);
                ch = this.charCodeAt(++this.cursorPos);
            }
            else {
                throw new ParamError(`Invalid \`${this.charAt(this.cursorPos)}\``, this.cursorPos);
            }
        }
        return text;
    }
    getToken() {
        let symbol = null;
        let startPos = 0;
        for (const item of symbols) {
            const n = this.template.indexOf(item.startToken, this.cursorPos);
            if (n >= 0 && (!symbol || n < startPos)) {
                symbol = item;
                startPos = n;
            }
        }
        return symbol || null;
    }
    parseToken() {
        let text = '';
        const startPos = this.cursorPos;
        let ch;
        while (this.cursorPos < this.template.length) {
            ch = this.charCodeAt(this.cursorPos);
            if (ch === ECharCodes.LESS_THAN || ch === ECharCodes.DOLAR) {
                const token = this.getToken();
                if (token) {
                    if (text.length > 0) {
                        this.addToken(ENodeType.Text, startPos, this.cursorPos, text);
                        text = '';
                    }
                    const start = this.cursorPos;
                    this.cursorPos += token.startToken.length;
                    switch (token.type) {
                        case ENodeType.Comment:
                            this.parseComment(start);
                            return;
                        case ENodeType.Directive:
                            this.parseDirective(start, Boolean(token.end));
                            return;
                        case ENodeType.Macro:
                            this.parseMacro(start, Boolean(token.end));
                            return;
                        case ENodeType.Interpolation:
                            this.parseInterpolation(start);
                            return;
                    }
                    break;
                }
            }
            text += this.charAt(this.cursorPos);
            ++this.cursorPos;
        }
        if (text.length > 0) {
            this.addToken(ENodeType.Text, startPos, this.cursorPos, text);
        }
        return;
    }
    addToken(type, start, end, text, params = '', isClose = false) {
        this.tokens.push(cToken(type, start, end, text, params, isClose));
    }
    parseComment(start) {
        const end = this.getNextPos(['-->']);
        if (end.pos === -1) {
            throw new ReferenceError(`Unclosed comment`);
        }
        const text = this.template.substring(this.cursorPos, end.pos);
        this.cursorPos = end.pos + end.text.length;
        this.addToken(ENodeType.Comment, start, this.cursorPos, text);
    }
    parseInterpolation(start) {
        const params = this.parseParams(['}']);
        this.addToken(ENodeType.Interpolation, start, this.cursorPos, '', params);
    }
    parseMacro(start, isClose) {
        const typeString = this.parseTag();
        if (typeString.length === 0) {
            throw new ParamError('Macro name cannot be empty', this.cursorPos);
        }
        const params = this.parseParams(['>', '/>']);
        this.addToken(ENodeType.Macro, start, this.cursorPos, typeString, params, isClose);
    }
    parseDirective(start, isClose) {
        const typeString = this.parseTag();
        if (typeString.length === 0) {
            throw new ParamError('Directive name cannot be empty', this.cursorPos);
        }
        const params = this.parseParams(['>', '/>']);
        this.addToken(ENodeType.Directive, start, this.cursorPos, typeString, params, isClose);
    }
    parseParams(endTags) {
        let paramText = '';
        let bracketLevel = 0;
        let inString = false;
        while (this.cursorPos <= this.template.length) {
            const ch = this.charCodeAt(this.cursorPos);
            const char = this.charAt(this.cursorPos);
            if (char === '"') {
                inString = !inString;
            }
            if (!inString) {
                if (ch === ECharCodes.OPAREN_CODE) {
                    ++bracketLevel;
                }
                else if (ch === ECharCodes.CPAREN_CODE) {
                    --bracketLevel;
                }
            }
            if (bracketLevel < 0) {
                throw new SyntaxError(`bracketLevel < 0`);
            }
            if (bracketLevel === 0 && !inString) {
                const nextPos = this.getNextPos(endTags);
                if (nextPos.pos !== -1 && this.cursorPos === nextPos.pos) {
                    this.cursorPos += nextPos.text.length;
                    return paramText;
                }
                else {
                    paramText += char;
                    ++this.cursorPos;
                }
            }
            else {
                paramText += char;
                ++this.cursorPos;
            }
        }
        throw new SyntaxError(`Unclosed directive or macro`);
    }
    charAt(i) {
        return this.template.charAt(i);
    }
    charCodeAt(i) {
        return this.template.charCodeAt(i);
    }
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
    NodeNames["Comment"] = "Comment";
    NodeNames["Switch"] = "Switch";
    NodeNames["SwitchCase"] = "SwitchCase";
    NodeNames["SwitchDefault"] = "SwitchDefault";
    NodeNames["Break"] = "Break";
    NodeNames["ConditionElse"] = "ConditionElse";
})(NodeNames || (NodeNames = {}));

function cAssign(params, start, end) {
    return { type: NodeNames.Assign, start, end, params };
}
function cGlobal(params, start, end) {
    return { type: NodeNames.Global, start, end, params };
}
function cCondition(params, start, end) {
    return { type: NodeNames.Condition, start, end, params, consequent: [] };
}
function cList(params, start, end) {
    return { type: NodeNames.List, start, end, params, body: [] };
}
function cMacro(params, start, end) {
    return { type: NodeNames.Macro, start, end, params, body: [] };
}
function cProgram(start, end) {
    return { type: NodeNames.Program, start, end, body: [] };
}
function cMacroCall(params, name, start, end) {
    return { type: NodeNames.MacroCall, start, end, name, params, body: [] };
}
function cText(text, start, end) {
    return { type: NodeNames.Text, start, end, text };
}
function cInclude(params, start, end) {
    return { type: NodeNames.Include, start, end, params };
}
function cInterpolation(params, start, end) {
    return { type: NodeNames.Interpolation, start, end, params };
}
function cLocal(params, start, end) {
    return { type: NodeNames.Local, start, end, params };
}
function cAttempt(start, end) {
    return { type: NodeNames.Attempt, start, end, body: [] };
}
function cComment(text, start, end) {
    return { type: NodeNames.Comment, start, end, text };
}
function cSwitch(params, start, end) {
    return { type: NodeNames.Switch, start, end, params, cases: [] };
}
function cSwitchCase(params, start, end) {
    return { type: NodeNames.SwitchCase, start, end, params, consequent: [] };
}
function cSwitchDefault(start, end) {
    return { type: NodeNames.SwitchDefault, start, end, consequent: [] };
}
function cBreak(start, end) {
    return { type: NodeNames.Break, start, end };
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
    switch: NodeNames.Switch,
    case: NodeNames.SwitchCase,
    default: NodeNames.SwitchDefault,
    break: NodeNames.Break,
};

function addToNode(parent, child) {
    switch (parent.type) {
        case NodeNames.Condition:
            parent.alternate ? parent.alternate.push(child) : parent.consequent.push(child);
            break;
        case NodeNames.List:
            parent.fallback ? parent.fallback.push(child) : parent.body.push(child);
            break;
        case NodeNames.Switch:
            if (child.type === NodeNames.SwitchCase || child.type === NodeNames.SwitchDefault) {
                parent.cases.push(child);
            }
            else if (parent.cases.length === 0) {
                if (child.type !== NodeNames.Text) {
                    throw new NodeError(`addToChild(${parent.type}, ${child.type}) failed`, child);
                }
            }
            else {
                parent.cases[parent.cases.length - 1].consequent.push(child);
            }
            break;
        case NodeNames.Macro:
        case NodeNames.Program:
            parent.body.push(child);
            break;
        case NodeNames.Attempt:
            parent.fallback ? parent.fallback.push(child) : parent.body.push(child);
            break;
        case NodeNames.MacroCall:
        case NodeNames.Assign:
        case NodeNames.Global:
        case NodeNames.Local:
            throw new NodeError(`addToChild(${parent.type}, ${child.type}) failed`, child);
        case NodeNames.Interpolation:
        case NodeNames.Include:
        case NodeNames.Text:
        case NodeNames.Comment:
        case NodeNames.SwitchDefault:
        case NodeNames.SwitchCase:
        case NodeNames.Break:
        default:
            throw new NodeError(`addToChild(${parent.type}, ${child.type}) failed`, child);
    }
    return child;
}
function tokenToNodeType(token) {
    switch (token.type) {
        case ENodeType.Directive:
            if (token.text in directives) {
                return directives[token.text];
            }
            throw new NodeError(`Directive \`${token.text}\` is not supported`, token);
        case ENodeType.Interpolation:
            return NodeNames.Interpolation;
        case ENodeType.Text:
            return NodeNames.Text;
        case ENodeType.Macro:
            return NodeNames.MacroCall;
        case ENodeType.Program:
            return NodeNames.Program;
        case ENodeType.Comment:
            return NodeNames.Comment;
    }
    throw new NodeError(`Unknow token \`${token.type}\` - \`${token.text}\``, token);
}
function addNodeChild(parent, token) {
    const tokenType = tokenToNodeType(token);
    switch (tokenType) {
        case NodeNames.Else:
            if (parent.type === NodeNames.Condition) {
                if (parent.alternate) {
                    throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token);
                }
                parent.alternate = [];
                return parent;
            }
            else if (parent.type === NodeNames.List) {
                if (parent.fallback) {
                    throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token);
                }
                parent.fallback = [];
                return parent;
            }
            break;
        case NodeNames.ConditionElse:
            if (parent.type === NodeNames.Condition) {
                const node = cCondition(token.params, token.start, token.end);
                if (parent.alternate) {
                    throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token);
                }
                parent.alternate = [];
                parent.alternate.push(node);
                return node;
            }
            break;
        case NodeNames.Recover:
            if (parent.type === NodeNames.Attempt) {
                if (parent.fallback) {
                    throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token);
                }
                parent.fallback = [];
                return parent;
            }
            break;
        case NodeNames.SwitchCase:
            if (parent.type === NodeNames.Switch) {
                parent.cases.push(cSwitchCase(token.params, token.start, token.end));
                return parent;
            }
            break;
        case NodeNames.SwitchDefault:
            if (parent.type === NodeNames.Switch) {
                parent.cases.push(cSwitchDefault(token.start, token.end));
                return parent;
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
        case NodeNames.MacroCall:
            return addToNode(parent, cMacroCall(token.params, token.text, token.start, token.end));
        case NodeNames.Comment:
            return addToNode(parent, cComment(token.text, token.start, token.end));
        case NodeNames.Switch:
            return addToNode(parent, cSwitch(token.params, token.start, token.end));
        case NodeNames.Break:
            return addToNode(parent, cBreak(token.start, token.end));
        case NodeNames.Program:
    }
    throw new NodeError(`addNodeChild(${parent.type}, ${tokenType}) is not supported`, token);
}
var EClosingType;
(function (EClosingType) {
    EClosingType[EClosingType["No"] = 0] = "No";
    EClosingType[EClosingType["Yes"] = 1] = "Yes";
    EClosingType[EClosingType["Partial"] = 2] = "Partial";
    EClosingType[EClosingType["Ignore"] = 3] = "Ignore";
})(EClosingType || (EClosingType = {}));
function isClosing(type, parentType, isClose) {
    switch (type) {
        case NodeNames.Program:
        case NodeNames.Attempt:
        case NodeNames.Macro:
        case NodeNames.Condition:
        case NodeNames.List:
        case NodeNames.Switch:
            return (type === parentType && isClose) ? EClosingType.Yes : EClosingType.No;
        case NodeNames.ConditionElse:
            return NodeNames.Condition === parentType ? EClosingType.Partial : EClosingType.No;
        case NodeNames.Else:
            return (NodeNames.Condition === parentType || NodeNames.List === parentType) ? EClosingType.Partial : EClosingType.No;
        case NodeNames.Recover:
            return (NodeNames.Attempt === parentType) ? EClosingType.Partial : EClosingType.No;
        case NodeNames.MacroCall:
            return EClosingType.Ignore;
        case NodeNames.Assign:
        case NodeNames.Global:
        case NodeNames.Local:
            return EClosingType.Ignore;
        case NodeNames.SwitchCase:
        case NodeNames.SwitchDefault:
            return EClosingType.Ignore;
        case NodeNames.Include:
        case NodeNames.Text:
        case NodeNames.Interpolation:
        case NodeNames.Comment:
        case NodeNames.Break:
            return EClosingType.Ignore;
    }
    throw new ReferenceError(`isClosing(${type}) failed`);
}

const errorMessages = {
    [EClosingType.No]: 'Unexpected close tag \`%s\`',
    [EClosingType.Ignore]: '\`%s\` can\'t self close',
    [EClosingType.Partial]: '\`%s\` can\'t self close',
};
class Parser {
    parse(template) {
        const ast = cProgram(0, template.length);
        const stack = [];
        let parent = ast;
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.parse(template);
        if (tokens.length === 0) {
            return { ast, tokens };
        }
        let token = null;
        for (token of tokens) {
            const tokenType = tokenToNodeType(token);
            const closing = isClosing(tokenType, parent.type, token.isClose);
            if (token.isClose) {
                if (closing !== EClosingType.Yes) {
                    throw new NodeError(util.format(errorMessages[closing], token.type), token);
                }
                const parentNode = stack.pop();
                if (!parentNode) {
                    throw new NodeError(`Stack is empty`, token);
                }
                parent = parentNode;
            }
            else {
                const node = addNodeChild(parent, token);
                if (closing !== EClosingType.Ignore) {
                    if (closing !== EClosingType.Partial) {
                        stack.push(parent);
                    }
                    parent = node;
                }
            }
        }
        if (stack.length > 0) {
            throw new NodeError(`Unclosed tag`, token ? token : stack.pop());
        }
        return { ast, tokens };
    }
}

exports.Parser = Parser;
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=index.js.map
