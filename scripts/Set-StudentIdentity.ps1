<#
.SYNOPSIS
    Gives an SPFx project the identity of one student: deterministic IDs and names per initials.

.DESCRIPTION
    All students deploy to ONE tenant app catalog. Two packages with the same solution ID
    overwrite each other; two components with the same ID make one student test another
    student's code. This script replaces every identity of the project with values derived
    from the student's initials:

      solution ID         package-solution.json solution.id (+ .yo-rc.json libraryId)
      feature IDs         package-solution.json features[].id (+ upgrade action paths)
      component IDs       every src/**/*.manifest.json "id" (+ elements.xml, serve.json,
                          teams/<id>_*.png)
      names               package.json name, solution name, .sppkg file name, web part titles

    The IDs are UUID v5 (SHA-1 name-based) from a fixed course namespace and a slot name such
    as "pm/vltava-portal/solution" or "pm/vltava-portal/component/PortalWebPart" (project =
    package.json name without the "-<initials>" suffix). Components are identified by their alias,
    which is the same in the student's own project and in every solution/ folder of the course.
    Consequences:
      - The same student always gets the same IDs: taking over start code from any module
        keeps the app catalog upgrade path and the pages working.
      - Running the script twice changes nothing (idempotent).
      - Two students with different initials never share an ID.

    A marker file .student-identity holds the initials; running with other initials on the
    same project is refused.

.PARAMETER Initials
    Student initials assigned by the instructor: 2-3 lowercase letters, optional digit when
    initials collide in the class (pm, pm2).

.PARAMETER ProjectPath
    SPFx project folder (contains package.json and config/). Defaults to the current folder.

.EXAMPLE
    ./Set-StudentIdentity.ps1 -Initials pm -WhatIf
    Shows the ID map and the files that would change.

.EXAMPLE
    ./Set-StudentIdentity.ps1 -Initials pm -ProjectPath .\vltava-portal
    Applies the identity.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][ValidatePattern('^[a-z]{2,3}[0-9]?$')][string]$Initials,
    [string]$ProjectPath = '.'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Fixed namespace of the course. Changing it changes every student ID.
$namespace = '25726300-b761-4d59-9669-697249a69168'
$guidPattern = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'

function New-UuidV5 {
    param([string]$Namespace, [string]$Name)
    # RFC 4122 byte order: hex digits of the namespace string, not Guid.ToByteArray().
    $hex = $Namespace.Replace('-', '')
    $nsBytes = [byte[]]::new(16)
    for ($i = 0; $i -lt 16; $i++) { $nsBytes[$i] = [Convert]::ToByte($hex.Substring($i * 2, 2), 16) }
    $nameBytes = [Text.Encoding]::UTF8.GetBytes($Name)
    $sha1 = [Security.Cryptography.SHA1]::Create()
    try { $hash = $sha1.ComputeHash([byte[]]($nsBytes + $nameBytes)) } finally { $sha1.Dispose() }
    $b = $hash[0..15]
    $b[6] = ($b[6] -band 0x0F) -bor 0x50   # version 5
    $b[8] = ($b[8] -band 0x3F) -bor 0x80   # RFC 4122 variant
    $s = -join ($b | ForEach-Object { $_.ToString('x2') })
    return '{0}-{1}-{2}-{3}-{4}' -f $s.Substring(0, 8), $s.Substring(8, 4), $s.Substring(12, 4), $s.Substring(16, 4), $s.Substring(20, 12)
}

$root = (Resolve-Path $ProjectPath).Path

# Path relative to the project, independent of short (8.3) vs. long path spelling.
function Get-RelativePath {
    param([string]$Path)
    Push-Location -LiteralPath $root
    try { return (Resolve-Path -LiteralPath $Path -Relative) -replace '^\.\\', '' } finally { Pop-Location }
}
$packageSolutionPath = Join-Path $root 'config\package-solution.json'
$packageJsonPath = Join-Path $root 'package.json'
if (-not (Test-Path $packageSolutionPath) -or -not (Test-Path $packageJsonPath)) {
    throw "Not an SPFx project: $root (missing package.json or config/package-solution.json)"
}

# ---- Marker: one project = one student --------------------------------------------------
$markerPath = Join-Path $root '.student-identity'
if (Test-Path $markerPath) {
    $existing = (Get-Content $markerPath -Raw).Trim()
    if ($existing -ne $Initials) {
        throw "Project already belongs to '$existing'. Use a fresh copy for '$Initials'."
    }
}

# ---- Build the ID map: old ID -> new ID per slot ----------------------------------------
$map = [ordered]@{}
$slots = [Collections.Generic.List[object]]::new()

# Project name without the student suffix: one student can own several projects
# (vltava-portal, kendo-sandbox) and each needs its own IDs.
$packageName = (Get-Content $packageJsonPath -Raw | ConvertFrom-Json).name
$projectBase = $packageName -replace "-$Initials$", ''

function Add-Slot {
    param([string]$Slot, [string]$OldId)
    $newId = New-UuidV5 -Namespace $namespace -Name "$Initials/$projectBase/$Slot"
    $script:slots.Add([pscustomobject]@{ Slot = $Slot; Old = $OldId.ToLowerInvariant(); New = $newId })
    if ($OldId.ToLowerInvariant() -ne $newId) { $script:map[$OldId.ToLowerInvariant()] = $newId }
}

$packageSolution = Get-Content $packageSolutionPath -Raw | ConvertFrom-Json
Add-Slot -Slot 'solution' -OldId $packageSolution.solution.id
$featureIndex = 0
foreach ($feature in @($packageSolution.solution.features)) {
    if ($feature -and $feature.id) {
        Add-Slot -Slot "feature/$featureIndex" -OldId $feature.id
        $featureIndex++
    }
}

$manifests = Get-ChildItem (Join-Path $root 'src') -Recurse -Filter '*.manifest.json'
foreach ($manifest in $manifests) {
    $text = Get-Content $manifest.FullName -Raw
    $id = [regex]::Match($text, '"id"\s*:\s*"(?<id>' + $guidPattern + ')"').Groups['id'].Value
    $alias = [regex]::Match($text, '"alias"\s*:\s*"(?<alias>[^"]+)"').Groups['alias'].Value
    if (-not $id -or -not $alias) {
        throw "Manifest without id or alias: $($manifest.FullName)"
    }
    Add-Slot -Slot "component/$alias" -OldId $id
}

$duplicates = $slots | Group-Object Old | Where-Object Count -gt 1
if ($duplicates) {
    throw "Two slots share one ID in the project: $(($duplicates | ForEach-Object { $_.Group.Slot }) -join ', ')"
}

$slots | Format-Table Slot, Old, New -AutoSize | Out-String | Write-Host

# ---- Replace IDs in project text files --------------------------------------------------
# Only source folders are scanned; build output and node_modules are never entered.
$excludedTop = 'node_modules', 'lib', 'lib-commonjs', 'lib-esm', 'lib-dts', 'temp', 'release', 'dist', 'jest-output', '.heft', '.git'
$include = '*.json', '*.xml', '*.ts', '*.tsx', '*.js', '*.md', '*.yml', '*.yaml'
$textFiles = @(
    Get-ChildItem -Path (Join-Path $root '*') -File -Include $include
    Get-ChildItem $root -Directory -Force | Where-Object { $excludedTop -notcontains $_.Name } |
        ForEach-Object { Get-ChildItem $_.FullName -Recurse -File -Include $include }
) | Where-Object { (Get-RelativePath $_.FullName) -notmatch '^sharepoint\\solution\\' }

$changed = [Collections.Generic.List[string]]::new()
foreach ($file in $textFiles) {
    $text = Get-Content $file.FullName -Raw
    if (-not $text) { continue }
    $updated = [regex]::Replace($text, $guidPattern, {
            param($m)
            $key = $m.Value.ToLowerInvariant()
            if ($map.Contains($key)) { return $map[$key] } else { return $m.Value }
        })
    if ($updated -ne $text) {
        $changed.Add((Get-RelativePath $file.FullName))
        if ($PSCmdlet.ShouldProcess($file.FullName, 'Replace IDs')) {
            [IO.File]::WriteAllText($file.FullName, $updated, [Text.UTF8Encoding]::new($false))
        }
    }
}

# ---- Rename Teams icons named after component IDs ---------------------------------------
$teamsDir = Join-Path $root 'teams'
if (Test-Path $teamsDir) {
    foreach ($icon in Get-ChildItem $teamsDir -File) {
        $m = [regex]::Match($icon.Name, "^(?<id>$guidPattern)(?<rest>_.+)$")
        if ($m.Success -and $map.Contains($m.Groups['id'].Value.ToLowerInvariant())) {
            $newName = $map[$m.Groups['id'].Value.ToLowerInvariant()] + $m.Groups['rest'].Value
            $changed.Add("teams\$($icon.Name) -> $newName")
            if ($PSCmdlet.ShouldProcess($icon.FullName, "Rename to $newName")) {
                # After a takeover (robocopy over an own project) the student's icon already
                # exists; the template icon replaces it (same image).
                Move-Item -LiteralPath $icon.FullName -Destination (Join-Path $teamsDir $newName) -Force
            }
        }
    }
}

# ---- Names: package, solution, .sppkg, web part titles ----------------------------------
function Update-File {
    param([string]$Path, [scriptblock]$Transform, [string]$What)
    $text = Get-Content $Path -Raw
    $updated = & $Transform $text
    if ($updated -ne $text) {
        $script:changed.Add("$(Get-RelativePath $Path) ($What)")
        if ($PSCmdlet.ShouldProcess($Path, $What)) {
            [IO.File]::WriteAllText($Path, $updated, [Text.UTF8Encoding]::new($false))
        }
    }
}

$suffix = "-$Initials"
Update-File -Path $packageJsonPath -What 'package name' -Transform {
    param($t)
    $rx = [regex]'(?m)^(\s*"name"\s*:\s*")(?<name>[^"]+)(")'
    $rx.Replace($t, { param($m) if ($m.Groups['name'].Value.EndsWith($suffix)) { $m.Value } else { $m.Groups[1].Value + $m.Groups['name'].Value + $suffix + '"' } }, 1)
}
Update-File -Path $packageSolutionPath -What 'solution name and package path' -Transform {
    param($t)
    $t = [regex]::Replace($t, '"name"\s*:\s*"(?<base>[^"]+?)-client-side-solution"', {
            param($m) if ($m.Groups['base'].Value.EndsWith($suffix)) { $m.Value } else { '"name": "' + $m.Groups['base'].Value + $suffix + '-client-side-solution"' } })
    [regex]::Replace($t, '"zippedPackage"\s*:\s*"(?<path>[^"]+?)\.sppkg"', {
            param($m) if ($m.Groups['path'].Value.EndsWith($suffix)) { $m.Value } else { '"zippedPackage": "' + $m.Groups['path'].Value + $suffix + '.sppkg"' } })
}

# Web part titles in preconfiguredEntries: every locale gets " (<initials>)". Extensions are
# skipped: their "title" keys are command labels, not catalog names.
$titleSuffix = " ($Initials)"
foreach ($manifest in $manifests) {
    if ((Get-Content $manifest.FullName -Raw) -notmatch '"componentType"\s*:\s*"WebPart"') { continue }
    Update-File -Path $manifest.FullName -What 'title suffix' -Transform {
        param($t)
        [regex]::Replace($t, '"title"\s*:\s*\{(?<body>[^}]*)\}', {
                param($m)
                $body = [regex]::Replace($m.Groups['body'].Value, '(?<key>"[A-Za-z-]+"\s*:\s*")(?<value>[^"]*)"', {
                        param($v)
                        $value = $v.Groups['value'].Value -replace ' \([a-z]{2,3}[0-9]?\)$', '' -replace ' \(<ini>\)$', ''
                        $v.Groups['key'].Value + $value + $titleSuffix + '"'
                    })
                '"title": {' + $body + '}'
            })
    }
}

if ($PSCmdlet.ShouldProcess($markerPath, "Write marker '$Initials'")) {
    Set-Content -Path $markerPath -Value $Initials -NoNewline
}

if ($changed.Count -eq 0) {
    Write-Host "Identity '$Initials' already applied; nothing changed." -ForegroundColor DarkGray
}
else {
    Write-Host "Changed $($changed.Count) item(s):" -ForegroundColor Green
    $changed | ForEach-Object { Write-Host "  $_" }
}
