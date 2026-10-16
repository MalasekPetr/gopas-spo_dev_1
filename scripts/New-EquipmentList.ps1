<#
.SYNOPSIS
    Creates the Equipment list on a student site and seeds it with fictional course data.

.DESCRIPTION
    Course script for the pnpjs block (day 3). Creates the list at <site>/Lists/Equipment with
    the columns the Equipment web part expects:

      Title (Text)        model name
      AssetTag (Text)     inventory number
      Category (Choice)   Laptop, Phone, Monitor, Accessory
      Status (Choice)     Available, Issued, Repair, Retired (default Available)
      AssignedTo (User)   person the item is issued to

    Idempotent: an existing list or column is left as it is; seed items are added only when the
    list is empty. Supports -WhatIf. All data is fictional course data.

    Requires PnP.PowerShell and an Entra ID app registration for interactive sign-in in the
    course tenant. The instructor provides its client ID; it is never stored in this repo.

.PARAMETER SiteUrl
    Full URL of the student site, e.g. https://<tenant>.sharepoint.com/sites/spodev-pm

.PARAMETER ClientId
    Client ID of the PnP interactive app registration in the course tenant.

.PARAMETER SkipSeed
    Creates the list and columns without seed items.

.EXAMPLE
    ./New-EquipmentList.ps1 -SiteUrl https://<tenant>.sharepoint.com/sites/spodev-pm -ClientId <guid>
    Creates the list and 12 seed items, signing in interactively (MFA).

.EXAMPLE
    ./New-EquipmentList.ps1 -SiteUrl https://<tenant>.sharepoint.com/sites/spodev-pm -ClientId <guid> -WhatIf
    Shows what would be created without changing the site.

.EXAMPLE
    ./New-EquipmentList.ps1 -SiteUrl https://<tenant>.sharepoint.com/sites/spodev-pm -ClientId <guid> -SkipSeed
    Creates an empty list, e.g. to test the empty state of the web part.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][ValidatePattern('^https://[^/]+\.sharepoint\.com/sites/[^/]+/?$')][string]$SiteUrl,
    [Parameter(Mandatory)][guid]$ClientId,
    [switch]$SkipSeed
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$listTitle = 'Equipment'
$listUrl = 'Lists/Equipment'

if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
    throw 'PnP.PowerShell is not installed. Run: Install-Module PnP.PowerShell -Scope CurrentUser'
}

Connect-PnPOnline -Url $SiteUrl -Interactive -ClientId $ClientId.ToString()

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
    @{ InternalName = 'AssetTag'; DisplayName = 'AssetTag'; Type = 'Text' },
    @{ InternalName = 'Category'; DisplayName = 'Category'; Type = 'Choice'; Choices = @('Laptop', 'Phone', 'Monitor', 'Accessory') },
    @{ InternalName = 'Status'; DisplayName = 'Status'; Type = 'Choice'; Choices = @('Available', 'Issued', 'Repair', 'Retired') },
    @{ InternalName = 'AssignedTo'; DisplayName = 'AssignedTo'; Type = 'User' }
)

foreach ($column in $columns) {
    if (-not $list) { break }   # -WhatIf on a missing list: nothing to add columns to
    $existing = Get-PnPField -List $listUrl -Identity $column.InternalName -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Column exists: $($column.InternalName)" -ForegroundColor DarkGray
        continue
    }
    if ($PSCmdlet.ShouldProcess("$listUrl/$($column.InternalName)", 'Add column')) {
        $params = @{
            List             = $listUrl
            InternalName     = $column.InternalName
            DisplayName      = $column.DisplayName
            Type             = $column.Type
            AddToDefaultView = $true
        }
        if ($column.ContainsKey('Choices')) { $params.Choices = $column.Choices }
        Add-PnPField @params | Out-Null
        Write-Host "Added column: $($column.InternalName)" -ForegroundColor Green
    }
}

if ($list -and $PSCmdlet.ShouldProcess("$listUrl/Status", 'Set default value Available')) {
    Set-PnPField -List $listUrl -Identity 'Status' -Values @{ DefaultValue = 'Available' } | Out-Null
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
$seed = @(
    @('ThinkPad T14 Gen 5', 'VS-NB-001', 'Laptop', 'Issued'),
    @('ThinkPad T14 Gen 5', 'VS-NB-002', 'Laptop', 'Available'),
    @('ThinkPad X1 Carbon', 'VS-NB-003', 'Laptop', 'Repair'),
    @('Surface Laptop 6', 'VS-NB-004', 'Laptop', 'Available'),
    @('iPhone 15', 'VS-PH-001', 'Phone', 'Issued'),
    @('Samsung Galaxy S24', 'VS-PH-002', 'Phone', 'Available'),
    @('Samsung Galaxy A55', 'VS-PH-003', 'Phone', 'Retired'),
    @('Dell P2723DE', 'VS-MO-001', 'Monitor', 'Available'),
    @('Dell P2723DE', 'VS-MO-002', 'Monitor', 'Issued'),
    @('Logitech MX Keys', 'VS-AC-001', 'Accessory', 'Available'),
    @('Logitech MX Master 3S', 'VS-AC-002', 'Accessory', 'Available'),
    @('Jabra Evolve2 65', 'VS-AC-003', 'Accessory', 'Repair')
)

foreach ($row in $seed) {
    $values = @{ Title = $row[0]; AssetTag = $row[1]; Category = $row[2]; Status = $row[3] }
    if ($row[3] -eq 'Issued' -and $me) { $values.AssignedTo = $me }
    if ($PSCmdlet.ShouldProcess($row[1], 'Add seed item')) {
        Add-PnPListItem -List $listUrl -Values $values | Out-Null
    }
}
Write-Host "Seeded $($seed.Count) items." -ForegroundColor Green
