<#switch mymessage>
  <#case 1>
    MyMessage is one
    <#break>

  <#case 15>
    MyMessage is fifteen
    <#break>

  <#case 152>
    MyMessage is one-five-two
    <#break>

  <#default>
    MyMessage is: ${mymessage}.
    <#break>

</#switch>
