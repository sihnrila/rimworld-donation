# find-rimworld.ps1
# Searches for RimWorld installation path (Steam default + additional libraries)

function Find-RimWorld {
    $candidates = [System.Collections.Generic.List[string]]::new()

    # 1) Default Steam install paths
    $candidates.Add("C:\Program Files (x86)\Steam\steamapps\common\RimWorld")
    $candidates.Add("C:\Program Files\Steam\steamapps\common\RimWorld")

    # 2) Parse Steam libraryfolders.vdf for additional library paths
    $vdfPaths = @(
        "C:\Program Files (x86)\Steam\steamapps\libraryfolders.vdf",
        "C:\Program Files\Steam\steamapps\libraryfolders.vdf"
    )
    foreach ($vdf in $vdfPaths) {
        if (Test-Path $vdf) {
            $content = Get-Content $vdf -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $pathMatches = [regex]::Matches($content, '"path"\s+"([^"]+)"')
                foreach ($m in $pathMatches) {
                    $lib = $m.Groups[1].Value -replace '\\\\', '\'
                    $candidates.Add("$lib\steamapps\common\RimWorld")
                }
            }
        }
    }

    # 3) Check all drive letters
    $drives = (Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root }).Root
    foreach ($drive in $drives) {
        $candidates.Add("${drive}Steam\steamapps\common\RimWorld")
        $candidates.Add("${drive}SteamLibrary\steamapps\common\RimWorld")
        $candidates.Add("${drive}Games\RimWorld")
    }

    # 4) Return first path where RimWorldWin64.exe exists
    foreach ($path in $candidates) {
        if (Test-Path "$path\RimWorldWin64.exe") {
            return $path
        }
    }
    return $null
}

# ── Main ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "Searching for RimWorld..." -ForegroundColor Cyan

$found = Find-RimWorld

if ($found) {
    Write-Host ""
    Write-Host "[Found] $found" -ForegroundColor Green
    Write-Host ""
    Write-Host "Managed DLL path:"
    Write-Host "  $found\RimWorldWin64_Data\Managed\" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Mod build command (run from project root):"
    Write-Host "  .\build-mod.ps1" -ForegroundColor Yellow
    Write-Host "  .\build-mod.ps1 -RimWorldPath `"$found`"" -ForegroundColor Yellow
    return $found
} else {
    Write-Host ""
    Write-Host "[Not found] Auto-detection failed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Find the RimWorld install path manually:"
    Write-Host "  Steam -> Library -> RimWorld -> Right-click -> Manage -> Browse local files"
    Write-Host ""
    Write-Host "Then specify the path directly:"
    Write-Host "  .\build-mod.ps1 -RimWorldPath `"D:\SteamLibrary\steamapps\common\RimWorld`"" -ForegroundColor Yellow
    return $null
}
