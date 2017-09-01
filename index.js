'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ETypeSymbol;
(function (ETypeSymbol) {
    ETypeSymbol[ETypeSymbol["None"] = 0] = "None";
    ETypeSymbol[ETypeSymbol["Directive"] = 1] = "Directive";
    ETypeSymbol[ETypeSymbol["DirectiveEnd"] = 2] = "DirectiveEnd";
    ETypeSymbol[ETypeSymbol["Macro"] = 3] = "Macro";
    ETypeSymbol[ETypeSymbol["Interpolation"] = 4] = "Interpolation";
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
//# sourceMappingURL=Types.js.map

const NodeConfig = {
    [EType.Program]: {
        isSelfClosing: false,
    },
    [EType.Text]: {
        isSelfClosing: true,
    },
    [EType.MacroCall]: {
        isSelfClosing: true,
    },
    [EType.Interpolation]: {
        isSelfClosing: true,
    },
    [EType.if]: {
        isSelfClosing: false,
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
        isSelfClosing: false,
    },
    [EType.elseif]: {
        isSelfClosing: false,
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

class ParserError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, ParserError.prototype);
    }
}
//# sourceMappingURL=ParserError.js.map

const symbols = [
    { startToken: '</#', endToken: '>', type: ETypeSymbol.DirectiveEnd },
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
        this.tokens = [];
        this.template = '';
        this.cursorPos = 0;
    }
    parse(template) {
        this.template = template;
        this.tokens = [];
        this.AST = {
            type: EType.Program,
            children: [],
        };
        this.cursorPos = 0;
        this.parseTokens();
        this.buildAST();
        return this.AST;
    }
    getConfig(type) {
        const cfg = NodeConfig[type];
        if (!cfg) {
            throw new ParserError(`Invalid Token`);
        }
        return cfg;
    }
    buildAST() {
        const stack = [];
        let parent = this.AST;
        for (const token of this.tokens) {
            const cfg = this.getConfig(token.type);
            if (cfg.isSelfClosing) {
                if (token.isClose) {
                    throw new ParserError(`Self closing token can't have close tag`);
                }
                const node = this.makeNode(token);
                parent.children.push(node);
            }
            else if (token.isClose) {
                let parentNode = parent;
                while (parentNode) {
                    if (parentNode.type === token.type) {
                        break;
                    }
                    const parentCfg = this.getConfig(token.type);
                    if (!parentCfg.isSelfClosing) {
                        throw new ParserError(`Missing close tag`);
                    }
                    parentNode = stack.pop();
                }
                if (!parentNode) {
                    throw new ParserError(`Closing tag is not alowed here`);
                }
                parentNode = stack.pop();
                if (!parentNode) {
                    throw new ParserError(`Closing tag is not alowed here`);
                }
                parent = parentNode;
            }
            else {
                const node = this.makeNode(token);
                parent.children.push(node);
                stack.push(parent);
                parent = node;
            }
        }
        if (stack.length > 0) {
            throw new ParserError(`Unclosed tag`);
        }
    }
    parseTokens() {
        while (this.cursorPos >= 0 && this.cursorPos < this.template.length) {
            const token = this.parseToken();
            if (!token) {
                this.tokens.push(this.makeToken(this.cursorPos, this.template.length));
                break;
            }
        }
    }
    makeToken(startPos, endPos, type = EType.Text, params = [], tag = '', isClose = false) {
        return {
            type,
            isClose,
            tag,
            text: type !== EType.Text ? '' : this.template.substring(startPos, endPos),
            params,
            loc: {
                startPos,
                endPos,
            },
        };
    }
    makeNode(token) {
        return {
            type: token.type,
            tag: token.tag,
            text: token.text,
            params: token.params,
            loc: token.loc,
            children: [],
        };
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
            this.tokens.push(this.makeToken(this.cursorPos, startPos - 1));
        }
        this.cursorPos = startPos;
        this.cursorPos += symbol.startToken.length;
        let node = null;
        switch (symbol.type) {
            case ETypeSymbol.Directive:
                node = this.parseDirective(symbol, startPos);
                break;
            case ETypeSymbol.DirectiveEnd:
                node = this.parseDirective(symbol, startPos, true);
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
            this.tokens.push(node);
        }
        ++this.cursorPos;
        return true;
    }
    parsePrint(symbol, startPos) {
        const params = this.parseParams(symbol.endToken);
        const node = this.makeToken(startPos, this.cursorPos, EType.Interpolation, params);
        return node;
    }
    parseMacro(symbol, startPos) {
        const typeString = this.parseTag(symbol.endToken);
        this.cursorPos += typeString.length;
        const params = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken);
        const node = this.makeToken(startPos, this.cursorPos, EType.MacroCall, params, typeString);
        return node;
    }
    parseDirective(symbol, startPos, isClose = false) {
        const typeString = this.parseTag(symbol.endToken);
        if (!(typeString in EType)) {
            throw new ParserError(`Unsupported directive ${typeString}`);
        }
        this.cursorPos += typeString.length;
        const params = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken);
        const node = this.makeToken(startPos, this.cursorPos, typeString, params, '', isClose);
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
//# sourceMappingURL=Parser.js.map

//# sourceMappingURL=index.js.map

exports.Parser = Parser;
//# sourceMappingURL=index.js.map
