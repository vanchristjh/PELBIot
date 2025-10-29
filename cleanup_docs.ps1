# PowerShell Script to Organize PELBIoT Documentation
# Purpose: Automatically move markdown files from root to organized docs/ structure

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PELBIoT PROJECT DOCUMENTATION CLEANUP SCRIPT             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "d:\PROJECT\PT\pelbiot"
Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Files to move to docs/realtime/
$realtimeFiles = @(
    "00_AUDIT_COMPLETION_SUMMARY.md",
    "00_PROJECT_DELIVERY_SUMMARY.md",
    "AUDIT_COMPLETION_STATUS.md",
    "AUDIT_DELIVERABLES_MANIFEST.md",
    "AUDIT_DOCUMENTATION_INDEX.md",
    "AUDIT_REAL_TIME_DATA.md",
    "IMPLEMENTATION_REAL_TIME_DATA.md",
    "IMPLEMENTATION_COMPLETE.md",
    "IMPLEMENTATION_SUMMARY.md",
    "QUICK_START_TESTING.md",
    "SUMMARY_REAL_TIME_STATUS.md",
    "BEFORE_AND_AFTER.md"
)

# Files to move to docs/guides/
$guidesFiles = @(
    "NAVIGATION_GUIDE.md",
    "DOCUMENTATION_INDEX.md",
    "QUICK_REFERENCE.md",
    "NEXT_ITERATIONS_ROADMAP.md"
)

# Files to move to docs/archive/
$archiveFiles = @(
    "FINAL_CLEANUP_SUMMARY.md",
    "CLEANUP_FINISHED.md",
    "IMPLEMENTATION_CHECKLIST.md",
    "ITERATION_1_VERIFICATION_REPORT.md",
    "ITERATION_2_ANALYSIS_REPORT.md",
    "ITERATION_3_IMPLEMENTATION_PLAN.md",
    "ITERATIONS_1-3_PROGRESS_SUMMARY.md",
    "PROJECT_STATUS_DASHBOARD.md",
    "SESSION_2_EXECUTIVE_SUMMARY.md",
    "EXECUTIVE_SUMMARY.md",
    "FINAL_STATUS_REPORT.md",
    "VISUAL_COMPARISON.md"
)

# Counters
$totalMoved = 0
$totalSkipped = 0

# Move realtime files
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Moving Real-Time Implementation Docs" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

foreach ($file in $realtimeFiles) {
    $sourcePath = Join-Path $projectRoot $file
    $destPath = Join-Path $projectRoot "docs\realtime" $file
    
    if (Test-Path $sourcePath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
        Move-Item $sourcePath $destPath -Force
        $totalMoved++
    } else {
        Write-Host "  ✗ $file (not found)" -ForegroundColor Gray
        $totalSkipped++
    }
}

Write-Host "Moved $($realtimeFiles.Count - $totalSkipped) files to docs/realtime/" -ForegroundColor Yellow
Write-Host ""

# Move guides files
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Moving Guides and Navigation Docs" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

foreach ($file in $guidesFiles) {
    $sourcePath = Join-Path $projectRoot $file
    $destPath = Join-Path $projectRoot "docs\guides" $file
    
    if (Test-Path $sourcePath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
        Move-Item $sourcePath $destPath -Force
        $totalMoved++
    } else {
        Write-Host "  ✗ $file (not found)" -ForegroundColor Gray
        $totalSkipped++
    }
}

Write-Host "Moved $($guidesFiles.Count - $totalSkipped) files to docs/guides/" -ForegroundColor Yellow
Write-Host ""

# Move archive files
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Moving Legacy/Archive Docs" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

foreach ($file in $archiveFiles) {
    $sourcePath = Join-Path $projectRoot $file
    $destPath = Join-Path $projectRoot "docs\archive" $file
    
    if (Test-Path $sourcePath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
        Move-Item $sourcePath $destPath -Force
        $totalMoved++
    } else {
        Write-Host "  ✗ $file (not found)" -ForegroundColor Gray
        $totalSkipped++
    }
}

Write-Host "Moved $($archiveFiles.Count - $totalSkipped) files to docs/archive/" -ForegroundColor Yellow
Write-Host ""

# Check remaining markdown files
$remainingMarkdown = @(Get-ChildItem "$projectRoot" -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" -and $_.Name -ne "CLEANUP_CHECKLIST.md" -and $_.Name -ne "PROJECT_STRUCTURE_PLAN.md" })

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CLEANUP SUMMARY                                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files moved: $totalMoved" -ForegroundColor Green
Write-Host "Remaining markdown files in root: $($remainingMarkdown.Count)" -ForegroundColor Yellow

if ($remainingMarkdown.Count -gt 0) {
    Write-Host ""
    Write-Host "Files still in root:" -ForegroundColor Yellow
    foreach ($file in $remainingMarkdown) {
        Write-Host "  - $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✓ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
