${foo}

<#include "./include/test_include.ftl">

<#if (foo > 1)>
  <#if foo gt a>
    ${foo.bar}
  </#if>
  ${foo.bar?toString}
</#if>

<@macro foo "./include/test_include.ftl">
