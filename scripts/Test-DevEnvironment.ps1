<#
.SYNOPSIS
    Checks that a student workstation is ready for SPFx 1.23.2 development.

.DESCRIPTION
    Read-only check used as a checkpoint in the dev-environment lab. It changes nothing on the
    machine; it only reports what is installed and what is missing.

    Checks:
      1. PowerShell 7 or newer.
      2. fnm is on PATH.
      3. Node.js major version 22 and at least 22.14.0 (the engines range SPFx 1.23.2 generates).
      4. npm is on PATH.
      5. git is on PATH (warning only -- the course can live without it until day 5).
      6. Global npm packages: yo, @microsoft/generator-sharepoint at the expected version,
         @rushstack/heft.
      7. gulp-cli is NOT installed globally (legacy toolchain; its presence usually means an old
         tutorial was followed).
      8. SPFX_SERVE_TENANT_DOMAIN is set and points to a *.sharepoint.com host.
      9. Optional: when -ProjectPath is given, the project has node_modules and its package.json
         references the expected SPFx version.

    Exit code 0 = all required checks passed, 1 = at least one required check failed.
    Warnings do not fail the run.

.PARAMETER ExpectedSpfxVersion
    SPFx version the course is pinned to. Defaults to 1.23.2.

.PARAMETER ProjectPath
    Optional path to an SPFx project folder to check as well.

.EXAMPLE
    ./Test-DevEnvironment.ps1
    Checks the workstation only.

.EXAMPLE
    ./Test-DevEnvironment.ps1 -ProjectPath C:\Projects\vltava-portal-pm
    Checks the workstation and the student's project.

.EXAMPLE
    ./Test-DevEnvironment.ps1 -ExpectedSpfxVersion 1.24.0
    Checks against a different SPFx version, e.g. after the course moves to a newer release.
#>
[CmdletBinding()]
param(
    [string]$ExpectedSpfxVersion = '1.23.2',
    [string]$ProjectPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
    param(
        [string]$Check,
        [ValidateSet('PASS', 'FAIL', 'WARN')][string]$Status,
        [string]$Detail
    )
    $results.Add([pscustomobject]@{ Check = $Check; Status = $Status; Detail = $Detail })
}

function Get-CommandOutput {
    param([string]$Name, [string[]]$Arguments)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { return $null }
    try { return ((& $Name @Arguments 2>$null) | Out-String).Trim() } catch { return $null }
}

# ---- 1. PowerShell ---------------------------------------------------------------------
$psMajor = $PSVersionTable.PSVersion.Major
if ($psMajor -ge 7) { Add-Result 'PowerShell' 'PASS' "$($PSVersionTable.PSVersion)" }
else { Add-Result 'PowerShell' 'FAIL' "$($PSVersionTable.PSVersion) -- run the lab in PowerShell 7 (pwsh)" }

# ---- 2. fnm ----------------------------------------------------------------------------
$fnmVersion = Get-CommandOutput 'fnm' @('--version')
if ($fnmVersion) { Add-Result 'fnm' 'PASS' $fnmVersion }
else { Add-Result 'fnm' 'FAIL' 'not on PATH -- install fnm and restart the terminal' }

# ---- 3. Node.js ------------------------------------------------------------------------
$nodeVersion = Get-CommandOutput 'node' @('--version')
if (-not $nodeVersion) {
    Add-Result 'Node.js' 'FAIL' 'not on PATH -- check the fnm line in $PROFILE, then: fnm install 22'
}
else {
    $parsed = [version]($nodeVersion.TrimStart('v'))
    if ($parsed.Major -eq 22 -and $parsed -ge [version]'22.14.0') {
        Add-Result 'Node.js' 'PASS' $nodeVersion
    }
    else {
        Add-Result 'Node.js' 'FAIL' "$nodeVersion -- SPFx $ExpectedSpfxVersion needs Node.js >=22.14.0 <23 (fnm use 22)"
    }
}

# ---- 4. npm ----------------------------------------------------------------------------
$npmVersion = Get-CommandOutput 'npm' @('--version')
if ($npmVersion) { Add-Result 'npm' 'PASS' $npmVersion }
else { Add-Result 'npm' 'FAIL' 'not on PATH -- comes with Node.js' }

# ---- 5. git ----------------------------------------------------------------------------
$gitVersion = Get-CommandOutput 'git' @('--version')
if ($gitVersion) { Add-Result 'git' 'PASS' $gitVersion }
else { Add-Result 'git' 'WARN' 'not on PATH -- needed on day 5 (CI/CD); install before then' }

# ---- 6 & 7. Global npm packages --------------------------------------------------------
if ($npmVersion) {
    $globalJson = Get-CommandOutput 'npm' @('ls', '--global', '--depth=0', '--json')
    $globalDeps = @{}
    if ($globalJson) {
        $parsedJson = $globalJson | ConvertFrom-Json
        if ($parsedJson.PSObject.Properties.Name -contains 'dependencies') {
            foreach ($p in $parsedJson.dependencies.PSObject.Properties) {
                $globalDeps[$p.Name] = $p.Value.version
            }
        }
    }

    if ($globalDeps.ContainsKey('yo')) { Add-Result 'yo (global)' 'PASS' $globalDeps['yo'] }
    else { Add-Result 'yo (global)' 'FAIL' 'npm install yo --global' }

    $gen = '@microsoft/generator-sharepoint'
    if (-not $globalDeps.ContainsKey($gen)) {
        Add-Result 'SPFx generator (global)' 'FAIL' "npm install $gen@$ExpectedSpfxVersion --global"
    }
    elseif ($globalDeps[$gen] -ne $ExpectedSpfxVersion) {
        Add-Result 'SPFx generator (global)' 'FAIL' "$($globalDeps[$gen]) installed, course uses $ExpectedSpfxVersion"
    }
    else { Add-Result 'SPFx generator (global)' 'PASS' $globalDeps[$gen] }

    if ($globalDeps.ContainsKey('@rushstack/heft')) { Add-Result 'Heft (global)' 'PASS' $globalDeps['@rushstack/heft'] }
    else { Add-Result 'Heft (global)' 'FAIL' 'npm install @rushstack/heft --global' }

    if ($globalDeps.ContainsKey('gulp-cli') -or $globalDeps.ContainsKey('gulp')) {
        Add-Result 'gulp NOT installed' 'WARN' 'gulp is global -- legacy toolchain; SPFx 1.23 projects do not use it'
    }
    else { Add-Result 'gulp NOT installed' 'PASS' 'no global gulp' }
}

# ---- 8. SPFX_SERVE_TENANT_DOMAIN -------------------------------------------------------
$tenantDomain = $env:SPFX_SERVE_TENANT_DOMAIN
if (-not $tenantDomain) {
    $tenantDomain = [Environment]::GetEnvironmentVariable('SPFX_SERVE_TENANT_DOMAIN', 'User')
    if ($tenantDomain) {
        Add-Result 'SPFX_SERVE_TENANT_DOMAIN' 'WARN' "set for the user, not in this session -- open a new terminal ($tenantDomain)"
    }
    else {
        Add-Result 'SPFX_SERVE_TENANT_DOMAIN' 'FAIL' 'not set -- see the dev-environment lab'
    }
}
elseif ($tenantDomain -notmatch '^[a-z0-9-]+\.sharepoint\.com(/.*)?$') {
    Add-Result 'SPFX_SERVE_TENANT_DOMAIN' 'FAIL' "'$tenantDomain' -- expected <tenant>.sharepoint.com[/sites/...], no https://"
}
else { Add-Result 'SPFX_SERVE_TENANT_DOMAIN' 'PASS' $tenantDomain }

# ---- 9. Optional project check ---------------------------------------------------------
if ($ProjectPath) {
    $pkgPath = Join-Path $ProjectPath 'package.json'
    if (-not (Test-Path $pkgPath)) {
        Add-Result 'Project package.json' 'FAIL' "not found in $ProjectPath"
    }
    else {
        $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
        $coreVersion = $null
        if ($pkg.PSObject.Properties.Name -contains 'dependencies' -and
            $pkg.dependencies.PSObject.Properties.Name -contains '@microsoft/sp-core-library') {
            $coreVersion = $pkg.dependencies.'@microsoft/sp-core-library'
        }
        if ($coreVersion -eq $ExpectedSpfxVersion) { Add-Result 'Project SPFx version' 'PASS' $coreVersion }
        else { Add-Result 'Project SPFx version' 'FAIL' "sp-core-library '$coreVersion', expected $ExpectedSpfxVersion" }

        if (Test-Path (Join-Path $ProjectPath 'node_modules\@microsoft\sp-core-library')) {
            Add-Result 'Project node_modules' 'PASS' 'installed'
        }
        else { Add-Result 'Project node_modules' 'FAIL' 'run npm install in the project folder' }
    }
}

# ---- Report ----------------------------------------------------------------------------
$colors = @{ PASS = 'Green'; WARN = 'Yellow'; FAIL = 'Red' }
Write-Host ''
foreach ($r in $results) {
    Write-Host ('[{0}] ' -f $r.Status) -ForegroundColor $colors[$r.Status] -NoNewline
    Write-Host ('{0,-26} {1}' -f $r.Check, $r.Detail)
}

$failed = @($results | Where-Object Status -eq 'FAIL').Count
$warned = @($results | Where-Object Status -eq 'WARN').Count
Write-Host ''
if ($failed -eq 0) {
    Write-Host "Environment ready ($warned warning(s))." -ForegroundColor Green
    exit 0
}
Write-Host "$failed check(s) failed, $warned warning(s)." -ForegroundColor Red
exit 1
