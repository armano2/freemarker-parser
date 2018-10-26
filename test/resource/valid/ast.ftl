<#assign x = 123><#assign x = 123><#global x = 123>
<#if x + 1 == 0>foo${y}bar<#else>${"static"}</#if>
<#switch x><#case 1>one<#case 2>two<#default>more</#switch>
<#function foo x y><#local x = 123><#return 1></#function>
<#--  <#list xs as x></#list>  -->
<#--  <#list xs>[<#items as x>${x}<#sep>, </#items>]<#else>None</#list>  -->
<#-- A comment -->

