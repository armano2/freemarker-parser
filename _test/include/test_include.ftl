Inner plannets data:
<#list planet_data as data>
Name:   ${data.name?lower_case}
Radius: ${data.radius}
Mass:   ${data.mass}
Volume: ${data.volume}
</#list>
