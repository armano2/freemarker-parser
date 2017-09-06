# freemarker-parser

[![Build Status](https://travis-ci.org/armano2/freemarker-parser.svg?branch=master)](https://travis-ci.org/armano2/freemarker-parser)
[![Coverage Status](https://codecov.io/gh/armano2/freemarker-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/armano2/freemarker-parser)

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
