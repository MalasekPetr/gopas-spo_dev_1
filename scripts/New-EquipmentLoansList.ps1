<#
.SYNOPSIS
    Creates the EquipmentLoans list (loan history) on a student site, linked to Equipment by a lookup.

.DESCRIPTION
    Course script for the equipment-desk block (day 5). Creates the list at
    <site>/Lists/EquipmentLoans with the columns the Equipment desk web part expects:

      Title (Text)          copy of the equipment name at the time of the loan
      Equipment (Lookup)    -> Equipment list, shows Title; stores the item ID
      Borrower (User)       person the item was issued to
      IssuedOn (DateTime)   when the item was issued
      ReturnedOn (DateTime) when it came back; empty = the loan is still open

    The Equipment list (scripts/New-EquipmentList.ps1, day 3) must exist on the same site:
    a lookup column points to a list by its ID and cannot point to another site.

    Idempotent: an existing list or column is left as it is; seed loans are added only when the
    list is empty. Seed = one open loan for every Equipment item with Status Issued (so history
    matches the current state) and two returned loans. Supports -WhatIf. Fictional course data.

    Requires PnP.PowerShell and an Entra ID app registration for interactive sign-in in the
    course tenant. The instructor provides its client ID; it is never stored in this repo.

.PARAMETER SiteUrl
    Full URL of the student site, e.g. https://<tenant>.sharepoint.com/sites/spodev-pm

.PARAMETER ClientId
    Client ID of the PnP interactive app registration in the course tenant.

.PARAMETER SkipSeed
    Creates the list and columns without seed loans.

.EXAMPLE
    ./New-EquipmentLoansList.ps1 -SiteUrl https://<tenant>.sharepoint.com/sites/spodev-pm -ClientId <guid>
    Creates the list and seed loans, signing in interactively (MFA).

.EXAMPLE
    ./New-EquipmentLoansList.ps1 -SiteUrl https://<tenant>.sharepoint.com/sites/spodev-pm -ClientId <guid> -WhatIf
    Shows what would be created without changing the site.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][ValidatePattern('^https://[^/]+\.sharepoint\.com/sites/[^/]+/?$')][string]$SiteUrl,
    [Parameter(Mandatory)][guid]$ClientId,
    [switch]$SkipSeed
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$listTitle = 'EquipmentLoans'
$listUrl = 'Lists/EquipmentLoans'
$equipmentUrl = 'Lists/Equipment'
# Fixed field ID: the same column has the same ID on every student site.
$lookupFieldId = 'a49d338a-6332-498f-a039-7e2e96ce1a2b'

if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
    throw 'PnP.PowerShell is not installed. Run: Install-Module PnP.PowerShell -Scope CurrentUser'
}

Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId $ClientId.ToString()

# ---- Prerequisite: Equipment -------------------------------------------------------------
$equipment = Get-PnPList -Identity $equipmentUrl -ErrorAction SilentlyContinue
if (-not $equipment) {
    throw "List $equipmentUrl not found. Run scripts/New-EquipmentList.ps1 first (day 3)."
}

# ---- List --------------------------------------------------------------------------------
$list = Get-PnPList -Identity $listUrl -ErrorAction SilentlyContinue
if ($list) {
    Write-Host "List exists: $listUrl" -ForegroundColor DarkGray
}
elseif ($PSCmdlet.ShouldProcess($listUrl, 'Create list')) {
    $list = New-PnPList -Title $listTitle -Url $listUrl -Template GenericList -OnQuickLaunch
    Write-Host "Created list: $listUrl" -ForegroundColor Green
}

# ---- Columns -----------------------------------------------------------------------------
$columns = @(
    @{ InternalName = 'Borrower'; DisplayName = 'Borrower'; Type = 'User' },
    @{ InternalName = 'IssuedOn'; DisplayName = 'IssuedOn'; Type = 'DateTime' },
    @{ InternalName = 'ReturnedOn'; DisplayName = 'ReturnedOn'; Type = 'DateTime' }
)

foreach ($column in $columns) {
    if (-not $list) { break }   # -WhatIf on a missing list: nothing to add columns to
    $existing = Get-PnPField -List $listUrl -Identity $column.InternalName -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column exists: $($column.InternalName)" -ForegroundColor DarkGray
        continue
    }
    if ($PSCmdlet.ShouldProcess("$listUrl/$($column.InternalName)", 'Add column')) {
        Add-PnPField -List $listUrl -InternalName $column.InternalName -DisplayName $column.DisplayName `
            -Type $column.Type -AddToDefaultView | Out-Null
        Write-Host "Added column: $($column.InternalName)" -ForegroundColor Green
    }
}

# Lookup from XML: the List attribute must be the ID of the Equipment list on THIS site.
if ($list) {
    $existing = Get-PnPField -List $listUrl -Identity 'Equipment' -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host 'Column exists: Equipment' -ForegroundColor DarkGray
    }
    elseif ($PSCmdlet.ShouldProcess("$listUrl/Equipment", 'Add lookup column')) {
        $fieldXml = '<Field Type="Lookup" ID="{' + $lookupFieldId + '}" Name="Equipment" StaticName="Equipment" ' +
            'DisplayName="Equipment" List="{' + $equipment.Id + '}" ShowField="Title" Required="TRUE" Indexed="TRUE" />'
        Add-PnPFieldFromXml -List $listUrl -FieldXml $fieldXml | Out-Null
        # Field XML has no AddToDefaultView; add the column to the default view (name is localized).
        $view = Get-PnPView -List $listUrl -Includes ViewFields | Where-Object { $_.DefaultView }
        Set-PnPView -List $listUrl -Identity $view.Id -Fields (@('Equipment') + @($view.ViewFields)) | Out-Null
        Write-Host 'Added column: Equipment (lookup -> Equipment)' -ForegroundColor Green
    }
}

# ---- Seed data ---------------------------------------------------------------------------
if ($SkipSeed -or -not $list) {
    return
}

$itemCount = (Get-PnPList -Identity $listUrl).ItemCount
if ($itemCount -gt 0) {
    Write-Host "List has $itemCount item(s); seed skipped." -ForegroundColor DarkGray
    return
}

$me = (Get-PnPWeb -Includes CurrentUser).CurrentUser.Email
$items = Get-PnPListItem -List $equipmentUrl -Fields 'Title', 'AssetTag', 'Status', 'AssignedTo'
$seeded = 0

# One open loan per issued item: the history agrees with the current state.
foreach ($item in $items | Where-Object { $_['Status'] -eq 'Issued' }) {
    $borrower = if ($item['AssignedTo']) { $item['AssignedTo'].Email } else { $me }
    $values = @{
        Title     = $item['Title']
        Equipment = $item.Id
        Borrower  = $borrower
        IssuedOn  = (Get-Date).AddDays(-14 - $seeded)
    }
    if ($PSCmdlet.ShouldProcess($item['AssetTag'], 'Add open loan')) {
        Add-PnPListItem -List $listUrl -Values $values | Out-Null
        $seeded++
    }
}

# Two returned loans on available items, so the History tab is not empty.
foreach ($item in $items | Where-Object { $_['Status'] -eq 'Available' } | Select-Object -First 2) {
    $values = @{
        Title      = $item['Title']
        Equipment  = $item.Id
        Borrower   = $me
        IssuedOn   = (Get-Date).AddDays(-60)
        ReturnedOn = (Get-Date).AddDays(-30)
    }
    if ($PSCmdlet.ShouldProcess($item['AssetTag'], 'Add returned loan')) {
        Add-PnPListItem -List $listUrl -Values $values | Out-Null
        $seeded++
    }
}
Write-Host "Seeded $seeded loans." -ForegroundColor Green
