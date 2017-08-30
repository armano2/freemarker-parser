'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class ParserError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, ParserError.prototype);
    }
}
//# sourceMappingURL=ParserError.js.map

var ETypeSymbol;
(function (ETypeSymbol) {
    ETypeSymbol[ETypeSymbol["None"] = 0] = "None";
    ETypeSymbol[ETypeSymbol["Directive"] = 1] = "Directive";
    ETypeSymbol[ETypeSymbol["Macro"] = 2] = "Macro";
    ETypeSymbol[ETypeSymbol["Interpolation"] = 3] = "Interpolation";
})(ETypeSymbol || (ETypeSymbol = {}));
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

const symbols = [
    { startToken: '<#', endToken: '>', type: ETypeSymbol.Directive },
    { startToken: '<@', endToken: '>', type: ETypeSymbol.Macro },
    { startToken: '${', endToken: '}', type: ETypeSymbol.Interpolation },
];
const whitespaces = [
    ' ',
    '\t',
    '\n',
    '\r',
];
//# sourceMappingURL=Symbols.js.map

class Parser {
    constructor() {
        this.cursorPos = 0;
        this.template = '';
        this.template = '';
        this.AST = this.makeNode(0, 0, EType.Program);
        this.cursorPos = 0;
    }
    parseTokens() {
        while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
            const token = this.parseNode(this.AST);
            if (!token) {
                this.AST.children.push(this.makeNode(this.cursorPos, this.template.length));
                break;
            }
        }
    }
    parse(template) {
        this.template = template;
        this.AST = this.makeNode(0, 0, EType.Program);
        this.cursorPos = 0;
        this.parseTokens();
        return this.AST;
    }
    makeNode(startPos, endPos, type = EType.Text, params = [], tag = '') {
        return {
            type,
            tag,
            text: type !== EType.Text ? '' : this.template.substring(startPos, endPos),
            params,
            loc: {
                startPos,
                endPos,
            },
            children: [],
        };
    }
    getNextWhitespacePos() {
        let pos = -1;
        for (const item of whitespaces) {
            const n = this.template.indexOf(item, this.cursorPos);
            if (n >= 0 && (pos === -1 || n < pos)) {
                pos = n;
            }
        }
        return pos;
    }
    parseTag() {
        const pos = this.getNextWhitespacePos();
        if (pos < 0) {
            throw new ParserError('Missing closing tag');
        }
        return this.template.substring(this.cursorPos, pos);
    }
    parseNode(parent) {
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
            parent.children.push(this.makeNode(this.cursorPos, startPos - 1));
        }
        this.cursorPos = startPos;
        this.cursorPos += symbol.startToken.length;
        let node = null;
        switch (symbol.type) {
            case ETypeSymbol.Directive:
                node = this.parseDirective(symbol, startPos);
                break;
            case ETypeSymbol.Macro:
                node = this.parseMacro(symbol, startPos);
                break;
            case ETypeSymbol.Interpolation:
                node = this.parsePrint(symbol, startPos);
                break;
            default:
                break;
        }
        if (node) {
            parent.children.push(node);
        }
        ++this.cursorPos;
        return true;
    }
    parsePrint(symbol, startPos) {
        const params = this.parseParams(symbol.endToken);
        const node = this.makeNode(startPos, this.cursorPos, EType.Interpolation, params);
        return node;
    }
    parseMacro(symbol, startPos) {
        const typeString = this.parseTag();
        this.cursorPos += typeString.length;
        const params = this.parseParams(symbol.endToken);
        const node = this.makeNode(startPos, this.cursorPos, EType.MacroCall, params, typeString);
        return node;
    }
    parseDirective(symbol, startPos) {
        const typeString = this.parseTag();
        if (!(typeString in EType)) {
            throw new ParserError(`Unsupported directive ${typeString}`);
        }
        this.cursorPos += typeString.length;
        const params = this.parseParams(symbol.endToken);
        const node = this.makeNode(startPos, this.cursorPos, typeString, params);
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
                    ++paramPos;
                    this.cursorPos = paramPos;
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
//# sourceMappingURL=Parser.js.map

//# sourceMappingURL=index.js.map

exports.Parser = Parser;
//# sourceMappingURL=index.js.map
