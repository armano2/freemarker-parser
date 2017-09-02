# freemarker-parser

[![Build Status](https://travis-ci.org/armano2/freemarkerjs.svg?branch=master)](https://travis-ci.org/armano2/freemarkerjs)
[![Coverage Status](https://codecov.io/gh/armano2/freemarkerjs/branch/master/graph/badge.svg)](https://codecov.io/gh/armano2/freemarkerjs)

Freemarker Parser is a javascript implementation of the Freemarker (http://freemarker.sourceforge.com).

This project contains experimental version of parser ftl to ast tree

## Currently supported:
  - interpolations `${foo}`
    - methods, i.e. `${avg(3, 5)}`
  - executing macro (only self closing `<@foo>`, `<@foo bar />`)
  - directives:
    - `#attempt`
      - `#recover`
    - `#assign` (only self closing `<#assign foo=bar>`, `<#assign foo=bar />`)
    - `#global` (only self closing `<#global foo=bar>`, `<#global foo=bar />`)
    - `#local` (only self closing `<#local foo=bar>`, `<#local foo=bar />`)
    - `#if`
      - `#elseif`
      - `#else`
    - `#list`
      - `#else`
    - `#include`
    - `#macro`
  - comments `<#-- -->`

## TODO:
  - built-ins:
    - `toUpperCase`
    - `toLowerCase`
    - `capitalize`
    - `length`
  - size builtin for arrays
  - support default values, i.e. `${user!"Anonymous"}`
  - null resistance in above expressions if in parenthesis
  - alternative syntax if starts with `[#ftl]`
  - directives: http://freemarker.sourceforge.net/docs/ref_directives.html
    - `#compress`
    - `#default`
    - `#escape`
      - `#noescape`
    - `#fallback`
    - `#function`
    - `#flush`
    - `#global`
    - `#import`
    - `#lt`
    - `#macro`
    - `#nested`
    - `#nt`
    - `#recurse`
    - `#return`
    - `#rt`
    - `#setting`
    - `#stop`
    - `#switch`
      - `#case`
      - `#break`
    - `#t`
    - `#visit`

  - string builtin for booleans, i.e. `boolean?string("yes", "no")`
