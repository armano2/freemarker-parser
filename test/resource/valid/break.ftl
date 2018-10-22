<#list 10 as x>
  ${x}
  <#if x == 3>
    <#break>
  </#if>
</#list>
