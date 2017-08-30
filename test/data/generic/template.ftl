${foo}

<#include "./include/test_include.ftl">

<#if (foo > 1)>
  <#if foo gt a  adasd asd asd asd as das             >
    ${foo.bar}
  </#if>
  ${foo.bar?toString}
</#if>

<@macro foo "./include/test_include.ftl">
