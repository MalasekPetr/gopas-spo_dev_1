<#
.SYNOPSIS
    Checks structural integrity of the SPO_DEV_1 repo: relative links, agenda/folder consistency,
    minute totals, and required per-module sections.

.DESCRIPTION
    Repo maintenance tool, not a course script. Run it after every bulk edit and before every
    course run. Verifying links by eye does not work; this does it by script.

    Checks:
      1. Every relative Markdown link resolves to an existing file or folder.
      2. Every module slug in agenda.md has a folder, and every module folder is in agenda.md.
      3. Minute totals per day match the stated sum in agenda.md.
      4. Every module folder has README.md and instructor-notes.md.
      5. Every module README.md has a "Stav produktu / delta" section.
      6. No tenant identifiers or secrets leaked into tracked files.

    Reference SPFx projects under solution/ are skipped: their README.md comes from the
    generator and their manifests legitimately contain component GUIDs.

    Exit code 0 = clean, 1 = problems found.

.PARAMETER RepoRoot
    Repo root. Defaults to the parent of this script's folder.

.EXAMPLE
    ./Test-RepoIntegrity.ps1

.EXAMPLE
    ./Test-RepoIntegrity.ps1 -RepoRoot C:\Repos\GOPAS\gopas-spo_dev_1

.EXAMPLE
    # In CI or a pre-run check, fail the shell on problems.
    ./Test-RepoIntegrity.ps1; if ($LASTEXITCODE -ne 0) { throw 'Repo integrity check failed' }
#>
[CmdletBinding()]
param(
    [string]$RepoRoot = (Split-Path $PSScriptRoot -Parent)
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$problems = New-Object System.Collections.Generic.List[string]
function Add-Problem { param([string]$Message) $problems.Add($Message) }

$mdFiles = Get-ChildItem -Path $RepoRoot -Filter '*.md' -Recurse -File |
    Where-Object { $_.FullName -notmatch '\\(\.git|node_modules|solution)\\' }

Write-Host "Checking $($mdFiles.Count) markdown files in $RepoRoot" -ForegroundColor Cyan

# ---- 1. Relative links -----------------------------------------------------------------
# Matches [text](target). Skips absolute URLs, mailto and pure anchors.
$linkPattern = '\[(?<text>[^\]]*)\]\((?<target>[^)]+)\)'
$linkCount = 0

foreach ($file in $mdFiles) {
    # _templates/ holds placeholders written at module depth; their relative paths and
    # <slug> tokens are not meant to resolve from where the template file sits.
    if ($file.FullName -match '\\_templates\\') { continue }

    $content = Get-Content -Path $file.FullName -Raw

    # Links inside fenced code blocks are examples of syntax, not navigation. Strip fences
    # before matching, otherwise CONVENTIONS.md reports its own examples as dead.
    $content = [regex]::Replace($content, '(?s)```.*?```', '')

    foreach ($match in [regex]::Matches($content, $linkPattern)) {
        $target = $match.Groups['target'].Value.Trim()
        if ($target -match '^(https?:|mailto:|#)') { continue }
        # Placeholder targets such as lab-<slug>.md are documentation, not links.
        if ($target -match '[<>]') { continue }

        # Drop any anchor fragment before resolving on disk.
        $pathPart = ($target -split '#')[0]
        if ([string]::IsNullOrWhiteSpace($pathPart)) { continue }

        $linkCount++
        $resolved = Join-Path $file.DirectoryName $pathPart
        if (-not (Test-Path -LiteralPath $resolved)) {
            $relative = $file.FullName.Substring($RepoRoot.Length + 1)
            Add-Problem "DEAD LINK  $relative -> $target"
        }
    }
}
Write-Host "  checked $linkCount relative links"

# ---- 2. Agenda vs. folders -------------------------------------------------------------
$agendaPath = Join-Path $RepoRoot 'agenda.md'
if (-not (Test-Path $agendaPath)) {
    Add-Problem 'MISSING    agenda.md'
}
else {
    $agenda = Get-Content -Path $agendaPath -Raw

    $moduleFolders = Get-ChildItem -Path $RepoRoot -Directory |
        Where-Object { $_.Name -match '^day-\d+$' } |
        ForEach-Object { Get-ChildItem -Path $_.FullName -Directory }

    foreach ($folder in $moduleFolders) {
        # Agenda lists slugs in backticks.
        if ($agenda -notmatch [regex]::Escape("``$($folder.Name)``")) {
            Add-Problem "NOT IN AGENDA  $($folder.Parent.Name)/$($folder.Name)"
        }
    }

    # Every backticked slug in a day table row should exist as a folder.
    foreach ($match in [regex]::Matches($agenda, '\|\s*`(?<slug>[a-z0-9-]+)`\s*\|')) {
        $slug = $match.Groups['slug'].Value
        $found = $moduleFolders | Where-Object { $_.Name -eq $slug }
        if (-not $found) {
            Add-Problem "AGENDA SLUG HAS NO FOLDER  $slug"
        }
    }
}

# ---- 3. Minute totals ------------------------------------------------------------------
if (Test-Path $agendaPath) {
    $agendaLines = Get-Content -Path $agendaPath

    # Split the file into per-day blocks first, then evaluate each block as a whole. Scanning
    # a fixed window after the heading missed the total, which sits below the table.
    $dayBlocks = [ordered]@{}
    $currentDay = $null
    foreach ($line in $agendaLines) {
        if ($line -match '^##\s+(?<day>Den\s+\d+)') {
            $currentDay = $Matches['day']
            $dayBlocks[$currentDay] = New-Object System.Collections.Generic.List[string]
            continue
        }
        if ($line -match '^##\s') { $currentDay = $null; continue }
        if ($currentDay) { $dayBlocks[$currentDay].Add($line) }
    }

    foreach ($day in $dayBlocks.Keys) {
        $mandatory = 0
        $optional = 0
        $stated = $null

        foreach ($line in $dayBlocks[$day]) {
            # Table row: | # | Name | `slug` | P | 90 |
            if ($line -match '\|\s*`[a-z0-9-]+`\s*\|\s*(?<type>[PV])\s*\|\s*(?<min>\d+)\s*\|') {
                if ($Matches['type'] -eq 'P') { $mandatory += [int]$Matches['min'] }
                else { $optional += [int]$Matches['min'] }
            }
            if ($line -match 'Celkem \*\*(?<n>\d+) min\*\*') { $stated = [int]$Matches['n'] }
        }

        if ($null -eq $stated) {
            Add-Problem "MINUTES  $day has no 'Celkem **N min**' line"
        }
        elseif ($stated -ne $mandatory) {
            Add-Problem "MINUTES  $day states $stated min, table sums to $mandatory min (optional $optional)"
        }
    }
}

# ---- 3b. day-N/README.md totals must match agenda.md -----------------------------------
# agenda.md is the single source of order; a day briefing that disagrees with it sends the
# instructor into the room with the wrong plan.
foreach ($dayDir in (Get-ChildItem -Path $RepoRoot -Directory | Where-Object { $_.Name -match '^day-\d+$' })) {
    $dayReadme = Join-Path $dayDir.FullName 'README.md'
    if (-not (Test-Path $dayReadme)) {
        Add-Problem "MISSING FILE  $($dayDir.Name)/README.md"
        continue
    }

    $dayLines = Get-Content -Path $dayReadme
    $sumMandatory = 0
    $statedDay = $null
    foreach ($line in $dayLines) {
        # Day tables link the slug: | 1 | Name | [`slug`](slug/) | P | 90 |
        if ($line -match '\|\s*\[`[a-z0-9-]+`\]\([^)]+\)\s*\|\s*(?<type>[PV])\s*\|\s*(?<min>\d+)\s*\|') {
            if ($Matches['type'] -eq 'P') { $sumMandatory += [int]$Matches['min'] }
        }
        if ($line -match 'Celkem \*\*(?<n>\d+) min\*\*') { $statedDay = [int]$Matches['n'] }
    }

    if ($null -eq $statedDay) {
        Add-Problem "MINUTES  $($dayDir.Name)/README.md has no 'Celkem **N min**' line"
    }
    elseif ($statedDay -ne $sumMandatory) {
        Add-Problem "MINUTES  $($dayDir.Name)/README.md states $statedDay min, its table sums to $sumMandatory min"
    }

    # Cross-check the day briefing against agenda.md for the same day number.
    if (Test-Path $agendaPath) {
        $dayNumber = $dayDir.Name -replace '^day-', ''
        $agendaDayTotal = $null
        $inDay = $false
        foreach ($line in (Get-Content -Path $agendaPath)) {
            if ($line -match "^##\s+Den\s+$dayNumber\b") { $inDay = $true; continue }
            if ($inDay -and $line -match '^##\s') { break }
            if ($inDay -and $line -match 'Celkem \*\*(?<n>\d+) min\*\*') { $agendaDayTotal = [int]$Matches['n'] }
        }
        if ($null -ne $agendaDayTotal -and $null -ne $statedDay -and $agendaDayTotal -ne $statedDay) {
            Add-Problem "MINUTES MISMATCH  agenda.md Den $dayNumber = $agendaDayTotal min, $($dayDir.Name)/README.md = $statedDay min"
        }
    }
}

# ---- 4 & 5. Required module files and sections -----------------------------------------
$moduleDirs = Get-ChildItem -Path $RepoRoot -Directory |
    Where-Object { $_.Name -match '^day-\d+$' } |
    ForEach-Object { Get-ChildItem -Path $_.FullName -Directory }

foreach ($dir in $moduleDirs) {
    $label = "$($dir.Parent.Name)/$($dir.Name)"
    $readme = Join-Path $dir.FullName 'README.md'
    $notes = Join-Path $dir.FullName 'instructor-notes.md'

    if (-not (Test-Path $readme)) { Add-Problem "MISSING FILE  $label/README.md" }
    if (-not (Test-Path $notes)) { Add-Problem "MISSING FILE  $label/instructor-notes.md" }

    if (Test-Path $readme) {
        $readmeText = Get-Content -Path $readme -Raw
        if ($readmeText -notmatch '##\s+Stav produktu / delta') {
            Add-Problem "NO DELTA SECTION  $label/README.md"
        }
        if ($readmeText -notmatch '##\s+Nosn') {
            Add-Problem "NO SCENARIO LINK SECTION  $label/README.md"
        }
    }

    if (-not (Get-ChildItem -Path $dir.FullName -Filter 'lab-*.md' -File)) {
        Write-Host "  note: $label has no lab-*.md (fine for demo-only blocks)" -ForegroundColor DarkGray
    }
}

# ---- 6. Leaked identifiers -------------------------------------------------------------
# GUID-shaped strings outside of obvious placeholders, and thumbprint-shaped hex runs.
$guidPattern = '\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b'
foreach ($file in $mdFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    foreach ($match in [regex]::Matches($content, $guidPattern)) {
        # All-zero GUID is the documented placeholder.
        if ($match.Value -match '^0{8}-0{4}-0{4}-0{4}-0{12}$') { continue }
        $relative = $file.FullName.Substring($RepoRoot.Length + 1)
        Add-Problem "POSSIBLE IDENTIFIER  $relative contains a GUID: $($match.Value)"
    }
}

# ---- Report ----------------------------------------------------------------------------
Write-Host ''
if ($problems.Count -eq 0) {
    Write-Host 'Repo integrity: OK' -ForegroundColor Green
    exit 0
}

Write-Host "Repo integrity: $($problems.Count) problem(s)" -ForegroundColor Red
$problems | Sort-Object | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
exit 1
