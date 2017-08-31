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
        m = `${m}\n\t${node.$nodeType}(${node.start}-${node.end})`;
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

function createDirective(token) {
    switch (token.type) {
        case EType.if:
        case EType.elseif:
            return new IfCondtion(token.type, token.params, token.startPos, token.endPos);
        case EType.list:
            return new List(token.type, token.params, token.startPos, token.endPos);
    }
    return new UnknownDirective(token.type, token.params, token.startPos, token.endPos);
}
function createNode(token) {
    switch (token.nodeType) {
        case ENodeType.Directive:
            return createDirective(token);
        case ENodeType.Macro:
            return new Macro(token.tag, token.params, token.startPos, token.endPos);
        case ENodeType.Interpolation:
            return new Interpolation(token.startPos, token.endPos, token.params);
        case ENodeType.Text:
            return new Text(token.text, token.startPos, token.endPos);
    }
    throw new ParserError('Unknown symbol');
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
                node = this.parseMacro(symbol, startPos);
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
    parseMacro(symbol, startPos) {
        const typeString = this.parseTag(symbol.endToken);
        this.cursorPos += typeString.length;
        const params = typeString.endsWith(symbol.endToken) ? [] : this.parseParams(symbol.endToken);
        const node = this.makeToken(ENodeType.Macro, startPos, this.cursorPos, EType.MacroCall, params, typeString);
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
                    throw new NodeError(`Self closing tag can't have close tag`, node);
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
