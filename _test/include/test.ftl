Solarsystem name:     ${solarsystem_data.name?capitalize}
Solarsystem location: ${solarsystem_data.location}
Solarsystem age:      ${solarsystem_data.age}

The planets in our solarsystem:
<#list planets as planet>
There are ${planet?length} letters in ${planet?upper_case}
</#list>

<#include "./include/test_include.ftl">
