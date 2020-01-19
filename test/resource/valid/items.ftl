<#list sequence>
    Part executed once if we have more than 0 items
    <#items as item>
        Part repeated for each item
    </#items>
    Part executed once if we have more than 0 items
<#else>
    Part executed when there are 0 items
</#list>
