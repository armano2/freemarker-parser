<#assign foo=2, bar=3>

<#if foo gt bar>
  foo(${foo}) is more than bar(${bar})
<#elseif ((foo lt a) || (foo > b))>
  foo(${foo}) is less than bar(${bar})
<#else>
  foo(${foo}) is equal bar(${bar})
</#if>
