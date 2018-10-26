<#--  <#ftl stripWhitespace=false>  -->
<#assign x = 1>
<#assign x = 1, y = 2>
<#assign x = 1>
<#assign x = 1, y = 2>
<#assign a += b + c>
<#assign a += 1, b -= 2, c *= 3, d /= 4, e %= 5, f++, g-->
<#global x = 1>
<#global x = 1, y = 2>
<#global x++>
<#macro m>
  <#local x = 1>
  <#local x = 1, y = 2>
</#macro>

<#assign x = 1>
<#assign x += 1>
<#assign x -= 1>
<#assign x *= 1>
<#assign x /= 1>
<#assign x %= 1>
<#assign y++>
<#assign x++>
<#assign y-->
<#assign x-->

<#assign x += 1+2>
<#assign x -= 1-1>
<#assign x *= 1*2>
<#assign x /= 1/7>
<#assign x %= 1%3>
<#assign y++>
<#assign x++>
<#assign y-->
<#assign x-->

<#assign x>
  foo ${bar}
</#assign>
<#local x>
  foo ${bar}
</#local>
<#global x>
  foo ${bar}
</#global>
