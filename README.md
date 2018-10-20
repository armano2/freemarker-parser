# freemarker-parser

[![Build Status](https://travis-ci.org/armano2/freemarker-parser.svg?branch=master)](https://travis-ci.org/armano2/freemarker-parser)
[![Coverage Status](https://codecov.io/gh/armano2/freemarker-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/armano2/freemarker-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/armano2/freemarker-parser.svg)](https://greenkeeper.io/)

Freemarker Parser is a javascript implementation of the Freemarker (http://freemarker.sourceforge.com).

This project contains experimental version of parser ftl to ast tree

## Installation
You can install `freemarker-parser` using [npm](https://npmjs.com):

```bash
$ npm install freemarker-parser --save-dev
```

## Usage
Require `freemarker-parser` inside of your JavaScript:

```js
const freemarker = require("freemarker-parser");
```

### Parser
```freemarker
<#assign f=1>

<#if f gt 0>
  ${f} > 0
<#else>
  ${f} < 0
</#if>
```

```js
const parser = new freemarker.Parser()
const astTree = parser.parse(template)

console.log(astTree)
```

## Currently supported:
  - interpolations `${foo}`
    - methods, i.e. `${avg(3, 5)}`
  - executing macro
  - directives:
    - `#attempt`
      - `#recover`
    - `#assign`
    - `#global`
    - `#local`
    - `#if`
      - `#elseif`
      - `#else`
    - `#list`
      - `#else`
    - `#include`
    - `#macro`
    - `#switch`
      - `#case`
      - `#default`
    - `#break`
    - `#function`
      - `#return`
  - comments `<#-- -->`

## TODO:
  - built-ins:
    - `?toUpperCase`
    - `?toLowerCase`
    - `?capitalize`
    - `?length`
    - `?string("yes", "no")`
  - size builtin for arrays
  - support default values, i.e. `${user!"Anonymous"}`
  - null resistance in above expressions if in parenthesis
  - alternative syntax if starts with `[#ftl]`
  - directives: http://freemarker.sourceforge.net/docs/ref_directives.html
    - `#compress`
    - `#escape`
      - `#noescape`
    - `#fallback`
    - `#flush`
    - `#import`
    - `#lt`
    - `#nested`
    - `#nt`
    - `#recurse`
    - `#rt`
    - `#setting`
    - `#stop`
    - `#t`
    - `#visit`
    - `#noparse`, `#noParse`
