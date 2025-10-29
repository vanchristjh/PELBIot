# PELBIOT v2.0.0 - PowerShell Testing Script
# Run this script to test all new features

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PELBIOT v2.0.0 - Feature Testing Script (PowerShell)      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$Description = ""
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "🧪 Test: $Name" -ForegroundColor Yellow
    if ($Description) { Write-Host "   📝 $Description" -ForegroundColor Gray }
    Write-Host "   📍 $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri     = "$baseUrl$Endpoint"
            Method  = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params['Body'] = $Body
        }
        
        $response = Invoke-WebRequest @params -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        if ($response.Content.Length -gt 0) {
            $content = $response.Content | ConvertFrom-Json
            Write-Host "   📦 Response:" -ForegroundColor Green
            Write-Host "      $(($content | ConvertTo-Json -Depth 1) | Select-Object -First 5)" -ForegroundColor White
        }
        
        $script:testsPassed++
        Write-Host ""
        
    } catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "   📌 Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
        $script:testsFailed++
        Write-Host ""
    }
}

# Test 1: Server Health
Write-Host "`n📋 BASIC FUNCTIONALITY TESTS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Test-Endpoint -Name "Server Health Check" `
    -Method "Get" `
    -Endpoint "/api/system/health" `
    -Headers @{"Accept" = "application/json"} `
    -Description "Verify server is responding"

# Test 2: Get Devices
Test-Endpoint -Name "List Devices" `
    -Method "Get" `
    -Endpoint "/api/devices" `
    -Headers @{"Accept" = "application/json"} `
    -Description "Retrieve list of registered devices"

# Test 3: Get Alerts
Test-Endpoint -Name "Get Active Alerts" `
    -Method "Get" `
    -Endpoint "/api/alerts/active" `
    -Headers @{"Accept" = "application/json"} `
    -Description "Retrieve active system alerts"

# Advanced Reporting Tests
Write-Host "`n🎯 NEW FEATURE TESTS - ADVANCED REPORTING" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$reportBody = @{
    format = "json"
    data = @{
        title = "System Status Report"
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        metrics = @{
            devices_online = 5
            alerts_active = 2
            uptime_hours = 120
        }
    }
} | ConvertTo-Json

Test-Endpoint -Name "Generate Report (JSON)" `
    -Method "Post" `
    -Endpoint "/api/reports/advanced/generate" `
    -Headers @{"Content-Type" = "application/json"; "Accept" = "application/json"} `
    -Body $reportBody `
    -Description "Generate JSON format report"

# Analytics Tests
$analyticsBody = @{
    data = @(10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
} | ConvertTo-Json

Test-Endpoint -Name "Calculate Statistics" `
    -Method "Post" `
    -Endpoint "/api/reports/advanced/analytics/statistics" `
    -Headers @{"Content-Type" = "application/json"; "Accept" = "application/json"} `
    -Body $analyticsBody `
    -Description "Calculate min, max, avg, median, stdDev"

# Group Data Test
$groupBody = @{
    data = @(
        @{ category = "A"; value = 10 }
        @{ category = "A"; value = 15 }
        @{ category = "B"; value = 20 }
        @{ category = "B"; value = 25 }
    )
    categoryKey = "category"
} | ConvertTo-Json

Test-Endpoint -Name "Group Data by Category" `
    -Method "Post" `
    -Endpoint "/api/reports/advanced/analytics/group" `
    -Headers @{"Content-Type" = "application/json"; "Accept" = "application/json"} `
    -Body $groupBody `
    -Description "Group array data by specified field"

# Trends Test
$trendsBody = @{
    data = @(
        @{ date = "2025-10-01"; value = 100 }
        @{ date = "2025-10-02"; value = 105 }
        @{ date = "2025-10-03"; value = 110 }
        @{ date = "2025-10-04"; value = 108 }
        @{ date = "2025-10-05"; value = 115 }
    )
    dateKey = "date"
    valueKey = "value"
    period = "daily"
} | ConvertTo-Json

Test-Endpoint -Name "Generate Trend Analysis" `
    -Method "Post" `
    -Endpoint "/api/reports/advanced/analytics/trends" `
    -Headers @{"Content-Type" = "application/json"; "Accept" = "application/json"} `
    -Body $trendsBody `
    -Description "Generate time-series trend data"

# Test Summary
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                     TEST RESULTS SUMMARY                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✅ Tests Passed: " -NoNewline
Write-Host "$testsPassed" -ForegroundColor Green

Write-Host "❌ Tests Failed: " -NoNewline
Write-Host "$testsFailed" -ForegroundColor Red

$totalTests = $testsPassed + $testsFailed
Write-Host "📊 Total Tests: $totalTests"

if ($testsFailed -eq 0 -and $testsPassed -gt 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Server is fully operational." -ForegroundColor Green
} elseif ($testsFailed -eq 0 -and $testsPassed -eq 0) {
    Write-Host "`n⚠️  No tests were executed. Check if server is running on port 5000." -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Some tests failed. Review the errors above." -ForegroundColor Yellow
}

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Review docs/API_DOCUMENTATION.md for complete API reference"
Write-Host "  2. Check DEVELOPER_QUICK_REFERENCE.md for code examples"
Write-Host "  3. Follow integration guide in docs/INTEGRATION_GUIDE.md"
Write-Host "  4. Use START_HERE_v2.0.0.md for navigation to all resources"
Write-Host ""
