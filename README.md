# freemarker-parser

[![Codecov](https://img.shields.io/codecov/c/github/armano2/freemarker-parser.svg)](https://codecov.io/gh/armano2/freemarker-parser/tree/master)
[![License](https://img.shields.io/github/license/armano2/freemarker-parser.svg)](https://github.com/armano2/freemarker-parser/blob/master/LICENSE.md)
[![npm](https://img.shields.io/npm/v/freemarker-parser.svg)](https://www.npmjs.com/package/freemarker-parser)

Freemarker Parser is a javascript implementation of the Freemarker (https://freemarker.apache.org).

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
const freemarker = require('freemarker-parser');

const parser = new freemarker.Parser();
const data = parser.parse(template);

console.log(data.ast);
console.log(data.tokens);
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
const freemarker = require('freemarker-parser');

const parser = new freemarker.Parser();
const data = parser.parse(template, {
  useSquareTags: true,
  parseLocation: true,
});

console.log(data.ast);
console.log(data.tokens);
```

## Currently supported:

- interpolations `${foo}`
  - methods, i.e. `${avg(3, 5)}`
- executing macro
- directives https://freemarker.apache.org/docs/ref_directives.html:
  - [`#attempt`](https://freemarker.apache.org/docs/ref_directive_attempt.html)
    - `#recover`
  - [`#assign`](https://freemarker.apache.org/docs/ref_directive_assign.html)
  - [`#global`](https://freemarker.apache.org/docs/ref_directive_global.html)
  - [`#local`](https://freemarker.apache.org/docs/ref_directive_local.html)
  - [`#if`](https://freemarker.apache.org/docs/ref_directive_if.html)
    - `#elseif`
    - `#else`
  - [`#list`](https://freemarker.apache.org/docs/ref_directive_list.html)
    - `#else`
    - `#break`
    - `#continue`
    - `#items`
  - [`#include`](https://freemarker.apache.org/docs/ref_directive_include.html)
  - [`#import`](https://freemarker.apache.org/docs/ref_directive_import.html)
  - [`#macro`](https://freemarker.apache.org/docs/ref_directive_macro.html)
  - [`#switch`](https://freemarker.apache.org/docs/ref_directive_switch.html)
    - `#case`
    - `#default`
    - `#break`
  - [`#compress`](https://freemarker.apache.org/docs/ref_directive_compress.html)
  - [`#function`](https://freemarker.apache.org/docs/ref_directive_function.html)
    - `#return`
  - [`#parse`](https://freemarker.apache.org/docs/ref_directive_parse.html) - [`#noparse`](https://freemarker.apache.org/docs/ref_directive_noparse.html)
  - [`#stop`](https://freemarker.apache.org/docs/ref_directive_stop.html)
  - [`#setting`](https://freemarker.apache.org/docs/ref_directive_setting.html)
  - [`#lt`](https://freemarker.apache.org/docs/ref_directive_lt.html)
  - [`#t`](https://freemarker.apache.org/docs/ref_directive_t.html)
  - [`#nt`](https://freemarker.apache.org/docs/ref_directive_nt.html)
  - [`#rt`](https://freemarker.apache.org/docs/ref_directive_rt.html)
  - [`#flush`](https://freemarker.apache.org/docs/ref_directive_flush.html)
  - [`#escape`](https://freemarker.apache.org/docs/ref_directive_escape.html)
    - `#noescape`
  - [`#autoesc`](https://freemarker.apache.org/docs/ref_directive_autoesc.html)
  - [`#noautoesc`](https://freemarker.apache.org/docs/ref_directive_noautoesc.html)
  - [`#outputformat`](https://freemarker.apache.org/docs/ref_directive_outputformat.html)
  - [`#ftl`](https://freemarker.apache.org/docs/ref_directive_ftl.html)
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
