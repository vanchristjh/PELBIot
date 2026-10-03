@echo off
REM Cleanup script to organize PELBIoT documentation
REM Moves markdown files from root to organized docs/ subfolders

setlocal enabledelayedexpansion

cd /d d:\PROJECT\PT\pelbiot

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   PELBIoT PROJECT DOCUMENTATION CLEANUP                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Move to docs/realtime/
echo Moving Real-Time Implementation Docs...
move "00_AUDIT_COMPLETION_SUMMARY.md" "docs\realtime\" >nul 2>&1
move "00_PROJECT_DELIVERY_SUMMARY.md" "docs\realtime\" >nul 2>&1
move "AUDIT_COMPLETION_STATUS.md" "docs\realtime\" >nul 2>&1
move "AUDIT_DELIVERABLES_MANIFEST.md" "docs\realtime\" >nul 2>&1
move "AUDIT_DOCUMENTATION_INDEX.md" "docs\realtime\" >nul 2>&1
move "AUDIT_REAL_TIME_DATA.md" "docs\realtime\" >nul 2>&1
move "IMPLEMENTATION_REAL_TIME_DATA.md" "docs\realtime\" >nul 2>&1
move "IMPLEMENTATION_COMPLETE.md" "docs\realtime\" >nul 2>&1
move "IMPLEMENTATION_SUMMARY.md" "docs\realtime\" >nul 2>&1
move "QUICK_START_TESTING.md" "docs\realtime\" >nul 2>&1
move "SUMMARY_REAL_TIME_STATUS.md" "docs\realtime\" >nul 2>&1
move "BEFORE_AND_AFTER.md" "docs\realtime\" >nul 2>&1
echo   ✓ Moved 12 files to docs/realtime/
echo.

REM Move to docs/guides/
echo Moving Guides and Navigation Docs...
move "NAVIGATION_GUIDE.md" "docs\guides\" >nul 2>&1
move "DOCUMENTATION_INDEX.md" "docs\guides\" >nul 2>&1
move "QUICK_REFERENCE.md" "docs\guides\" >nul 2>&1
move "NEXT_ITERATIONS_ROADMAP.md" "docs\guides\" >nul 2>&1
echo   ✓ Moved 4 files to docs/guides/
echo.

REM Move to docs/archive/
echo Moving Legacy/Archive Docs...
move "FINAL_CLEANUP_SUMMARY.md" "docs\archive\" >nul 2>&1
move "CLEANUP_FINISHED.md" "docs\archive\" >nul 2>&1
move "IMPLEMENTATION_CHECKLIST.md" "docs\archive\" >nul 2>&1
move "ITERATION_1_VERIFICATION_REPORT.md" "docs\archive\" >nul 2>&1
move "ITERATION_2_ANALYSIS_REPORT.md" "docs\archive\" >nul 2>&1
move "ITERATION_3_IMPLEMENTATION_PLAN.md" "docs\archive\" >nul 2>&1
move "ITERATIONS_1-3_PROGRESS_SUMMARY.md" "docs\archive\" >nul 2>&1
move "PROJECT_STATUS_DASHBOARD.md" "docs\archive\" >nul 2>&1
move "SESSION_2_EXECUTIVE_SUMMARY.md" "docs\archive\" >nul 2>&1
move "EXECUTIVE_SUMMARY.md" "docs\archive\" >nul 2>&1
move "FINAL_STATUS_REPORT.md" "docs\archive\" >nul 2>&1
move "VISUAL_COMPARISON.md" "docs\archive\" >nul 2>&1
echo   ✓ Moved 12 files to docs/archive/
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║   CLEANUP SUMMARY                                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Moved files by category:
echo   - docs/realtime/: 12 files
echo   - docs/guides/: 4 files
echo   - docs/archive/: 12 files
echo   TOTAL: 28 files organized
echo.

REM Count remaining markdown files
for /f %%A in ('dir /b *.md 2^>nul ^| find /c /v ""') do set count=%%A
echo Remaining markdown files in root: %count%
echo.

echo ✓ CLEANUP COMPLETE!
echo.
echo Next steps:
echo   1. Move CLEANUP_CHECKLIST.md to docs/guides/
echo   2. Move PROJECT_STRUCTURE_PLAN.md to docs/guides/
echo   3. Run: npm run build
echo   4. Run: npm start
echo.
