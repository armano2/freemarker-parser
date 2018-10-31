# freemarker-parser

[![Codecov](https://img.shields.io/codecov/c/github/armano2/freemarker-parser.svg)](https://circleci.com/gh/armano2/freemarker-parser/tree/master)
[![CircleCI](https://img.shields.io/circleci/project/github/armano2/freemarker-parser/master.svg)](https://circleci.com/gh/armano2/freemarker-parser/tree/master)
[![License](https://img.shields.io/github/license/armano2/freemarker-parser.svg)](https://github.com/armano2/freemarker-parser/blob/master/LICENSE.md)
[![Greenkeeper](https://badges.greenkeeper.io/armano2/freemarker-parser.svg)](https://github.com/armano2/freemarker-parser/blob/master/LICENSE.md)
[![npm](https://img.shields.io/npm/v/freemarker-parser.svg)](https://www.npmjs.com/package/freemarker-parser)

Freemarker Parser is a javascript implementation of the Freemarker (http://freemarker.sourceforge.com).

This project contains **experimental version** of parser ftl to ast tree

## Installation
You can install `freemarker-parser` using [npm](https://npmjs.com):

```bash
$ npm install freemarker-parser --save-dev
```

## Usage
Require `freemarker-parser` inside of your JavaScript:

### Parser 
```ftl
<#assign f=1>

<#if f gt 0>
  ${f} > 0
<#else>
  ${f} < 0
</#if>
```
```ts
const freemarker = require("freemarker-parser")

const parser = new freemarker.Parser()
const data = parser.parse(template)

console.log(data.ast)
console.log(data.tokens)
```

### Parser (bracket style)
```ftl
[#assign f=1]

[#if f gt 0]
  ${f} > 0
[#else]
  ${f} < 0
[/#if]
```
```ts
const freemarker = require("freemarker-parser")

const parser = new freemarker.Parser()
const data = parser.parse(template, {
  useSquareTags: true,
  parseLocation : true,
})

console.log(data.ast)
console.log(data.tokens)
```

## Currently supported:
  - interpolations `${foo}`
    - methods, i.e. `${avg(3, 5)}`
  - executing macro
  - directives: https://freemarker.apache.org/
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
    - `#import`
    - `#macro`
    - `#switch`
      - `#case`
      - `#default`
    - `#break`
    - `#compress`
    - `#function`
      - `#return`
    - `#noparse`, `#noParse`
    - `#stop`
    - `#setting`
    - `#lt`
    - `#t`
    - `#nt`
    - `#rt`
    - `#flush`
    - `#escape`
      - `#noescape`
  - comments `<#-- -->`
  - built-ins:
    - `?toUpperCase`
    - `?toLowerCase`
    - `?capitalize`
    - `?length`
    - `?string("yes", "no")`
  - support default values, i.e. `${user!"Anonymous"}`

## TODO:
  - directives:
    - `#fallback`
    - `#nested`
    - `#recurse`
    - `#visit`
