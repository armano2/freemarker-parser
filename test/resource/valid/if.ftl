<#assign x = 1>

- <#if x == 1>good</#if>
- <#if x == 1></#if>good
- <#if x == 1>goo${missing!'d'}</#if>
- <#if x == 0>wrong</#if>good

- <#if x == 1>good<#else>wrong</#if>
- <#if x == 0>wrong<#else>good</#if>

- <#if x == 1>good<#elseif x == 2>wrong<#else>wrong</#if>
- <#if x == 1>good<#elseif x == 1>wrong<#else>wrong</#if>
- <#if x == 0>wrong<#elseif x == 1>good<#else>wrong</#if>
- <#if x == 0>wrong<#elseif x == 2>wrong<#else>good</#if>

- <#if x == 1>good<#elseif x == 1>wrong</#if>
- <#if x == 0>wrong<#elseif x == 1>good</#if>
- <#if x == 0>wrong<#elseif x == 2>wrong</#if>good
- <#if x == 0>wrong<#elseif x == 1><#else>wrong</#if>good

<#-- Same with pre-calculable results, just in case later the dead code will be optimized out: -->
- <#if 1 == 1>good</#if>
- <#if 1 == 0>wrong</#if>good
- <#if 1 == 1>goo${missing!'d'}</#if>
- <#if 1 == 0>wrong</#if>good

- <#if 1 == 1>good<#else>wrong</#if>
- <#if 1 == 0>wrong<#else>good</#if>

- <#if 1 == 1>good<#elseif 1 == 2>wrong<#else>wrong</#if>
- <#if 1 == 1>good<#elseif 1 == 1>wrong<#else>wrong</#if>
- <#if 1 == 0>wrong<#elseif 1 == 1>good<#else>wrong</#if>
- <#if 1 == 0>wrong<#elseif 1 == 2>wrong<#else>good</#if>

- <#if 1 == 1>good<#elseif 1 == 1>wrong</#if>
- <#if 1 == 0>wrong<#elseif 1 == 1>good</#if>
- <#if 1 == 0>wrong<#elseif 1 == 2>wrong</#if>good
- <#if 1 == 0>wrong<#elseif 1 == 1><#else>wrong</#if>good

<#-- Varying branch choice of the same AST nodes: -->
<#list [1, 2, 3, 4] as x>
- <#if x == 1>1</#if>
- <#if x == 2>2</#if>
- <#if x == 3>3</#if>
- <#if x == 1>is 1<#else>isn't 1</#if>
- <#if x == 2>is 2<#else>isn't 2</#if>
- <#if x == 3>is 3<#else>isn't 3</#if>
- Finally, it's: <#if x == 1>1<#elseif x == 2>2<#elseif x == 3>3<#else>4</#if>
</#list>

<#-- nested -->
<#list [1, 2, 3] as x><#list [1, 2, 3] as y>
  <#assign y = x * x>
  <#if x == 1>
    1:
    <#if (x > y)>
      > ${y}
    <#elseif x == y>
      == ${y}
    <#else>
      <= ${y}
    </#if>
  <#elseif x == 2>
    2:
    <#if (x > y)>
      > ${y}
    <#elseif x == y>
      == ${y}
    <#else>
      <= ${y}
    </#if>
  <#else>
    3:
    <#if (x > y)>
      > ${y}
    <#elseif x == y>
      == ${y}
    <#else>
      <= ${y}
    </#if>
    <#if x == 3 && y == 3>
      End
    </#if>
  </#if>
</#list></#list>

