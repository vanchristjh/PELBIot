# Remove Unicode BOM from React component files
# This script fixes the eslint unicode-bom warnings

$files = @(
    "src\pages\Alarm.js",
    "src\pages\Laporan.js",
    "src\pages\LoadProfile.js",
    "src\pages\MasterData.js",
    "src\pages\Report.js",
    "src\pages\Trafo.js",
    "src\pages\Trend.js",
    "src\pages\Tutorial.js",
    "src\pages\Verifiable.js",
    "src\pages\WSLive.js",
    "src\pages\WeatherStation.js"
)

Write-Host "Removing Unicode BOM from React files..." -ForegroundColor Cyan
Write-Host ""

$fixed = 0
$errors = 0

foreach ($file in $files) {
    $fullPath = "d:\PROJECT\PT\pelbiot\$file"
    
    if (Test-Path $fullPath) {
        try {
            # Read file as bytes
            $content = [System.IO.File]::ReadAllBytes($fullPath)
            
            # Check if file has BOM (UTF-8 BOM is EF BB BF)
            if ($content.Length -gt 3 -and $content[0] -eq 0xEF -and $content[1] -eq 0xBB -and $content[2] -eq 0xBF) {
                # Remove BOM by skipping first 3 bytes
                $newContent = $content[3..($content.Length - 1)]
                
                # Write back without BOM
                [System.IO.File]::WriteAllBytes($fullPath, $newContent)
                
                Write-Host "FIXED: $file" -ForegroundColor Green
                $fixed++
            } else {
                Write-Host "OK: $file" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "ERROR: $file - $_" -ForegroundColor Red
            $errors++
        }
    }
    else {
        Write-Host "NOT FOUND: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Fixed: $fixed files" -ForegroundColor Green
Write-Host "Errors: $errors files" -ForegroundColor Red
Write-Host ""
Write-Host "Next: Run npm start to verify!" -ForegroundColor Yellow
