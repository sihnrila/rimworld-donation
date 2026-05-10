<#
.SYNOPSIS
    RimDonation mod build script

.DESCRIPTION
    Searches for RimWorld installation, builds the C# mod,
    and copies the DLL to release/RimWorldDonationMod/Assemblies/

.PARAMETER RimWorldPath
    RimWorld install path (auto-detected if omitted)

.EXAMPLE
    .\build-mod.ps1
    .\build-mod.ps1 -RimWorldPath "D:\SteamLibrary\steamapps\common\RimWorld"
#>

param(
    [string]$RimWorldPath = ""
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot

# ── Step 1: Find RimWorld ────────────────────────────────────────────────────
Write-Host "[1/4] Searching for RimWorld..." -ForegroundColor Cyan

if (-not $RimWorldPath) {
    $candidates = [System.Collections.Generic.List[string]]::new()
    $candidates.Add("C:\Program Files (x86)\Steam\steamapps\common\RimWorld")
    $candidates.Add("C:\Program Files\Steam\steamapps\common\RimWorld")

    # Parse Steam libraryfolders.vdf for additional library paths
    $vdfPaths = @(
        "C:\Program Files (x86)\Steam\steamapps\libraryfolders.vdf",
        "C:\Program Files\Steam\steamapps\libraryfolders.vdf"
    )
    foreach ($vdf in $vdfPaths) {
        if (Test-Path $vdf) {
            $content = Get-Content $vdf -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $matches2 = [regex]::Matches($content, '"path"\s+"([^"]+)"')
                foreach ($m in $matches2) {
                    $lib = $m.Groups[1].Value -replace '\\\\', '\'
                    $candidates.Add("$lib\steamapps\common\RimWorld")
                }
            }
        }
    }

    # Check all drive letters
    $drives = (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root }).Root
    foreach ($drive in $drives) {
        $candidates.Add("${drive}Steam\steamapps\common\RimWorld")
        $candidates.Add("${drive}SteamLibrary\steamapps\common\RimWorld")
        $candidates.Add("${drive}Games\RimWorld")
    }

    foreach ($path in $candidates) {
        if (Test-Path "$path\RimWorldWin64.exe") {
            $RimWorldPath = $path
            break
        }
    }
}

if (-not $RimWorldPath -or -not (Test-Path "$RimWorldPath\RimWorldWin64.exe")) {
    Write-Host ""
    Write-Host "ERROR: RimWorld not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please specify the path manually:"
    Write-Host '  .\build-mod.ps1 -RimWorldPath "D:\SteamLibrary\steamapps\common\RimWorld"'
    Write-Host ""
    Write-Host "Tip: Steam -> RimWorld -> Right-click -> Manage -> Browse local files"
    exit 1
}

Write-Host "  Found: $RimWorldPath" -ForegroundColor Green

# ── Step 2: Verify required DLLs ────────────────────────────────────────────
Write-Host "[2/4] Checking RimWorld DLLs..." -ForegroundColor Cyan

$assemblyDll  = "$RimWorldPath\RimWorldWin64_Data\Managed\Assembly-CSharp.dll"
$unityCoreDll = "$RimWorldPath\RimWorldWin64_Data\Managed\UnityEngine.CoreModule.dll"
$harmonyDll   = "$RimWorldPath\Data\Core\Assemblies\0Harmony.dll"

$missing = @()
if (-not (Test-Path $assemblyDll))  { $missing += "Assembly-CSharp.dll" }
if (-not (Test-Path $unityCoreDll)) { $missing += "UnityEngine.CoreModule.dll" }
if (-not (Test-Path $harmonyDll))   { $missing += "0Harmony.dll" }

if ($missing.Count -gt 0) {
    Write-Host "  ERROR: Missing DLLs:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    Write-Host "  Check if RimWorld path is correct."
    exit 1
}

Write-Host "  Assembly-CSharp.dll    [OK]" -ForegroundColor Green
Write-Host "  UnityEngine.CoreModule [OK]" -ForegroundColor Green
Write-Host "  0Harmony.dll           [OK]" -ForegroundColor Green

# ── Step 3: Check dotnet SDK ─────────────────────────────────────────────────
Write-Host "[3/4] Checking .NET SDK..." -ForegroundColor Cyan

$dotnetVer = dotnet --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: dotnet SDK not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Install .NET SDK 8:"
    Write-Host "    winget install Microsoft.DotNet.SDK.8"
    Write-Host "  Or download: https://dotnet.microsoft.com/download"
    exit 1
}
Write-Host "  dotnet $dotnetVer [OK]" -ForegroundColor Green

# ── Step 4: Build ────────────────────────────────────────────────────────────
Write-Host "[4/4] Building mod..." -ForegroundColor Cyan

$csprojPath = Join-Path $ScriptDir "rimworld-mod\RimDonation.csproj"

dotnet build $csprojPath `
    -c Release `
    "/p:RimWorldPath=$RimWorldPath" `
    /p:OutputPath=Assemblies\ `
    /p:AppendTargetFrameworkToOutputPath=false `
    --nologo

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build failed. Check the error log above." -ForegroundColor Red
    exit 1
}

# ── Copy to release folder ───────────────────────────────────────────────────
$srcDll  = Join-Path $ScriptDir "rimworld-mod\Assemblies\RimDonation.dll"
$destDir = Join-Path $ScriptDir "release\RimWorldDonationMod\Assemblies"

if (Test-Path $srcDll) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Copy-Item $srcDll $destDir -Force

    Write-Host ""
    Write-Host "Build succeeded!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Output files:"
    Write-Host "  $srcDll"
    Write-Host "  $destDir\RimDonation.dll"
    Write-Host ""
    Write-Host "Install the mod:"
    Write-Host "  Copy  release\RimWorldDonationMod  to  RimWorld\Mods\"
} else {
    Write-Host "ERROR: DLL not found at: $srcDll" -ForegroundColor Red
    exit 1
}
