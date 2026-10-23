<#
.SYNOPSIS
    Measures SPFx bundle sizes (raw and gzip) after a production build.

.DESCRIPTION
    Reads release/assets/*.js of an SPFx project built with `npm run build` and reports, per
    bundle, the raw size and the gzip size (System.IO.Compression, optimal level). The gzip size
    is an estimate of the transfer size; the real transfer depends on the CDN compression.

    Used in three places of the course:
      - bundle-baseline (day 3): first measured baseline, saved with -OutFile.
      - performance-caching (day 4): the same measurement after optimization, compared with
        -BaselineFile.
      - ci-cd-quality (day 5): quality gate in the pipeline with -MaxBytes.

    Exit code 0 = OK, 1 = a bundle exceeds -MaxBytes, 2 = no build output found.

.PARAMETER ProjectPath
    SPFx project folder. Defaults to the current folder.

.PARAMETER OutFile
    Optional path of a JSON file to write the measurement to.

.PARAMETER BaselineFile
    Optional JSON file from an earlier run; the report then shows the delta per bundle.

.PARAMETER MaxBytes
    Optional limit for the raw size of any single code bundle (web parts, extensions and
    lazy-loaded chunks; locale files are ignored).

.EXAMPLE
    ./Measure-BundleSize.ps1 -ProjectPath . -OutFile ./measurements/baseline.json
    Measures the current build and saves the baseline.

.EXAMPLE
    ./Measure-BundleSize.ps1 -ProjectPath . -BaselineFile ./measurements/baseline.json
    Compares the current build with the saved baseline.

.EXAMPLE
    ./Measure-BundleSize.ps1 -ProjectPath . -MaxBytes 300000
    Fails (exit code 1) when a bundle is larger than 300000 bytes, e.g. in a CI pipeline.
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$ProjectPath = '.',
    [string]$OutFile,
    [string]$BaselineFile,
    [long]$MaxBytes = 0
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression

function Get-GzipSize {
    param([byte[]]$Bytes)
    $buffer = New-Object System.IO.MemoryStream
    $gzip = New-Object System.IO.Compression.GZipStream($buffer, [System.IO.Compression.CompressionLevel]::Optimal)
    $gzip.Write($Bytes, 0, $Bytes.Length)
    $gzip.Close()
    return $buffer.ToArray().Length
}

$assets = Join-Path $ProjectPath 'release/assets'
$files = @(Get-ChildItem -Path $assets -Filter '*.js' -File -ErrorAction SilentlyContinue)
if ($files.Count -eq 0) {
    Write-Host "No build output in $assets -- run 'npm run build' first." -ForegroundColor Red
    exit 2
}

$baseline = @{}
if ($BaselineFile) {
    foreach ($entry in (Get-Content -Path $BaselineFile -Raw | ConvertFrom-Json).bundles) {
        $baseline[$entry.name] = $entry
    }
}

$bundles = foreach ($file in $files | Sort-Object Name) {
    # Strip the content hash: portal-web-part_0ce65e....js -> portal-web-part
    $name = $file.BaseName -replace '_[0-9a-f]{20,}$', ''
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    [pscustomobject]@{
        name = $name
        raw  = $bytes.Length
        gzip = Get-GzipSize -Bytes $bytes
    }
}

$report = foreach ($bundle in $bundles) {
    $row = [ordered]@{ Bundle = $bundle.name; Raw = $bundle.raw; Gzip = $bundle.gzip }
    if ($baseline.ContainsKey($bundle.name)) {
        $row.RawDelta = $bundle.raw - [long]$baseline[$bundle.name].raw
        $row.GzipDelta = $bundle.gzip - [long]$baseline[$bundle.name].gzip
    }
    [pscustomobject]$row
}
$report | Format-Table -AutoSize | Out-Host

if ($OutFile -and $PSCmdlet.ShouldProcess($OutFile, 'Write measurement')) {
    $dir = Split-Path -Path $OutFile -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [ordered]@{
        measured = (Get-Date).ToString('yyyy-MM-dd HH:mm')
        machine  = $env:COMPUTERNAME
        bundles  = @($bundles)
    } | ConvertTo-Json -Depth 4 | Set-Content -Path $OutFile -Encoding utf8
    Write-Host "Saved: $OutFile"
}

if ($MaxBytes -gt 0) {
    # Every code bundle counts: web parts, extensions and lazy-loaded chunks; not locale files.
    $tooBig = @($bundles | Where-Object { $_.name -notmatch 'Strings_[a-z]{2}-[a-z]{2}$' -and $_.raw -gt $MaxBytes })
    if ($tooBig.Count -gt 0) {
        $tooBig | ForEach-Object { Write-Host "Bundle $($_.name) has $($_.raw) B, limit is $MaxBytes B." -ForegroundColor Red }
        exit 1
    }
    Write-Host "All code bundles are within $MaxBytes B." -ForegroundColor Green
}
exit 0
