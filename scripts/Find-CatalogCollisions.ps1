<#
.SYNOPSIS
    Instructor check: lists course solutions in the tenant app catalog and flags identity problems.

.DESCRIPTION
    Run before the first deployment of the week (day 3 morning) and whenever a student reports
    "my web part shows someone else's code". Reports:

      TEMPLATE   a package carries the course template solution ID -- it was deployed without
                 scripts/Set-StudentIdentity.ps1 and the next such upload overwrites it
      NO-SUFFIX  a vltava-portal package whose name has no -<initials> suffix
      OK         a personalized package (initials parsed from the name)

    Two students with the SAME initials produce the same IDs; the catalog then silently holds
    only the last upload. The script cannot see that -- initials are unique by assignment
    (second "pm" becomes "pm2").

    Optional -Components: reads the app catalog list of component manifests and reports one
    component ID used by two solutions. The list URL and field names are NOT verified on the
    course tenant; when the list is not found the check is skipped with a warning.

    Requires PnP.PowerShell, an interactive app registration (client ID from the instructor
    file, never in this repo) and app catalog read access.

.PARAMETER AppCatalogUrl
    URL of the tenant app catalog site, e.g. https://<tenant>.sharepoint.com/sites/appcatalog

.PARAMETER ClientId
    Client ID of the PnP interactive app registration in the course tenant.

.PARAMETER Components
    Also check component IDs across solutions (best effort, see description).

.EXAMPLE
    ./Find-CatalogCollisions.ps1 -AppCatalogUrl https://<tenant>.sharepoint.com/sites/appcatalog -ClientId <guid>
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][ValidatePattern('^https://[^/]+\.sharepoint\.com/sites/[^/]+/?$')][string]$AppCatalogUrl,
    [Parameter(Mandatory)][guid]$ClientId,
    [switch]$Components
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Solution ID of the course template (solution/ folders in the public repo). Not a tenant value.
$templateSolutionId = '63b58c1b-d1ac-4c19-8506-3f5e9e607ac5'
$personalized = '^vltava-portal-(?<ini>[a-z]{2,3}[0-9]?)-client-side-solution$'

if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
    throw 'PnP.PowerShell is not installed. Run: Install-Module PnP.PowerShell -Scope CurrentUser'
}

Connect-PnPOnline -Url $AppCatalogUrl -Interactive -ClientId $ClientId.ToString()

$apps = @(Get-PnPApp -Scope Tenant | Where-Object { $_.Title -like 'vltava-portal*' -or $_.Id.ToString() -eq $templateSolutionId })

$report = foreach ($app in $apps) {
    $id = $app.Id.ToString().ToLowerInvariant()
    $m = [regex]::Match($app.Title, $personalized)
    $state = if ($id -eq $templateSolutionId) { 'TEMPLATE' } elseif (-not $m.Success) { 'NO-SUFFIX' } else { 'OK' }
    [pscustomobject]@{
        State    = $state
        Initials = if ($m.Success) { $m.Groups['ini'].Value } else { '' }
        Title    = $app.Title
        Version  = $app.AppCatalogVersion
        Deployed = $app.Deployed
        Id       = $id
    }
}

$report | Sort-Object State, Initials | Format-Table -AutoSize

$problems = @($report | Where-Object State -ne 'OK')
if ($problems.Count) {
    Write-Warning "$($problems.Count) package(s) need attention: run Set-StudentIdentity.ps1 in the student's project, rebuild, upload, then delete the old package."
}
else {
    Write-Host "$(@($report).Count) course package(s), all personalized." -ForegroundColor Green
}

if ($Components) {
    $list = Get-PnPList -Identity 'Lists/ComponentManifests' -ErrorAction SilentlyContinue
    if (-not $list) {
        Write-Warning 'Component manifest list not found in the app catalog; component check skipped.'
        return
    }
    $items = Get-PnPListItem -List $list -PageSize 500 -Fields 'ClientComponentId', 'SolutionId'
    $shared = $items |
        Group-Object { $_['ClientComponentId'] } |
        Where-Object { @($_.Group | ForEach-Object { $_['SolutionId'] } | Sort-Object -Unique).Count -gt 1 }
    if ($shared) {
        Write-Warning 'Component IDs used by more than one solution:'
        $shared | ForEach-Object { "  $($_.Name)" }
    }
    else {
        Write-Host 'No component ID is shared between solutions.' -ForegroundColor Green
    }
}
