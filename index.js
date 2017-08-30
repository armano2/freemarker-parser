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
    ETypeSymbol[ETypeSymbol["Print"] = 3] = "Print";
})(ETypeSymbol || (ETypeSymbol = {}));
var EType;
(function (EType) {
    EType["Program"] = "@program";
    EType["Text"] = "@text";
    EType["MacroCall"] = "@macro";
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

const symbols = [
    { startToken: '<#', endToken: '>', type: ETypeSymbol.Directive },
    { startToken: '<@', endToken: '>', type: ETypeSymbol.Macro },
    { startToken: '${', endToken: '}', type: ETypeSymbol.Print },
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
        this.pos = 0;
        this.template = '';
        this.template = '';
        this.AST = this.makeNode(0, 0, EType.Program);
        this.pos = 0;
    }
    parseTokens() {
        while (this.pos >= 0 && this.pos < this.template.length) {
            const token = this.parseNode(this.AST);
            if (!token) {
                this.AST.childrens.push(this.makeNode(this.pos, this.template.length));
                break;
            }
        }
    }
    parse(template) {
        this.template = template;
        this.AST = this.makeNode(0, 0, EType.Program);
        this.pos = 0;
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
            childrens: [],
        };
    }
    getNextWhitespacePos() {
        let pos = -1;
        for (const item of whitespaces) {
            const n = this.template.indexOf(item, this.pos);
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
        return this.template.substring(this.pos, pos);
    }
    parseNode(parent) {
        let symbol = null;
        let startPos = 0;
        for (const item of symbols) {
            const n = this.template.indexOf(item.startToken, this.pos);
            if (n >= 0 && (!symbol || n < startPos)) {
                symbol = item,
                    startPos = n;
            }
        }
        if (!symbol) {
            return false;
        }
        if (startPos - 1 > this.pos) {
            parent.childrens.push(this.makeNode(this.pos, startPos - 1));
            this.pos = startPos;
        }
        this.pos += symbol.startToken.length;
        let node = null;
        switch (symbol.type) {
            case ETypeSymbol.Directive:
                node = this.parseDirective(startPos);
                break;
            case ETypeSymbol.Macro:
                node = this.parseMacro(startPos);
                break;
            case ETypeSymbol.Print:
                break;
        }
        if (node) {
            parent.childrens.push(node);
        }
        ++this.pos;
        return true;
    }
    parseMacro(startPos) {
        const params = [];
        const typeString = this.parseTag();
        this.pos += typeString.length;
        const node = this.makeNode(startPos, this.pos, EType.MacroCall, params, typeString);
        return node;
    }
    parseDirective(startPos) {
        const params = [];
        const typeString = this.parseTag();
        if (!(typeString in EType)) {
            throw new ParserError(`Unsupported directive ${typeString}`);
        }
        this.pos += typeString.length;
        const node = this.makeNode(startPos, this.pos, typeString, params);
        return node;
    }
}

//# sourceMappingURL=index.js.map

exports.Parser = Parser;
//# sourceMappingURL=index.js.map
