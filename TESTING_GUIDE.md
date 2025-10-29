# 🧪 QUICK TESTING GUIDE - PELBIOT v2.0.0

## 🚀 Quickest Way to Test (30 seconds)

### Option 1: PowerShell Script (Recommended for Windows)
```powershell
cd D:\PROJECT\PT\pelbiot
.\Test-Features.ps1
```

**That's it!** The script will:
- ✅ Test server health
- ✅ Test device listing
- ✅ Test alert system
- ✅ Test new reporting feature
- ✅ Test analytics engine
- ✅ Show pass/fail results

---

## 📝 Manual Testing Commands

### If PowerShell Script Doesn't Work

#### Test 1: Check Server is Running
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/system/health" -Method Get
```

Expected: Status code 200, JSON response

---

#### Test 2: List Devices
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/devices" -Method Get

# Print response
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected: Array of devices

---

#### Test 3: Test NEW Report Generation Feature
```powershell
$body = @{
    format = "json"
    data = @{
        title = "Test Report"
        summary = "Testing new reporting feature"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/reports/advanced/generate" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected: Success message, report generated

---

#### Test 4: Test NEW Analytics - Statistics
```powershell
$body = @{
    data = @(10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/reports/advanced/analytics/statistics" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected: Statistics object with min, max, avg, median, stdDev

---

#### Test 5: Test NEW Analytics - Grouping
```powershell
$body = @{
    data = @(
        @{ type = "A"; value = 10 }
        @{ type = "A"; value = 15 }
        @{ type = "B"; value = 20 }
        @{ type = "B"; value = 25 }
    )
    categoryKey = "type"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/reports/advanced/analytics/group" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected: Grouped data by category

---

#### Test 6: Test NEW Analytics - Trends
```powershell
$body = @{
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

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/reports/advanced/analytics/trends" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected: Trend data with analysis

---

## 🐚 Using Git Bash or Linux Commands

If you have Git Bash or WSL, use these curl commands instead:

### Test Server Health
```bash
curl -X GET http://localhost:5000/api/system/health
```

### Test Report Generation
```bash
curl -X POST http://localhost:5000/api/reports/advanced/generate \
  -H "Content-Type: application/json" \
  -d '{"format":"json","data":{"title":"Test Report"}}'
```

### Test Statistics
```bash
curl -X POST http://localhost:5000/api/reports/advanced/analytics/statistics \
  -H "Content-Type: application/json" \
  -d '{"data":[10,20,30,40,50]}'
```

### Test Grouping
```bash
curl -X POST http://localhost:5000/api/reports/advanced/analytics/group \
  -H "Content-Type: application/json" \
  -d '{
    "data":[
      {"type":"A","value":10},
      {"type":"A","value":15},
      {"type":"B","value":20}
    ],
    "categoryKey":"type"
  }'
```

### Test Trends
```bash
curl -X POST http://localhost:5000/api/reports/advanced/analytics/trends \
  -H "Content-Type: application/json" \
  -d '{
    "data":[
      {"date":"2025-10-01","value":100},
      {"date":"2025-10-02","value":105},
      {"date":"2025-10-03","value":110}
    ],
    "dateKey":"date",
    "valueKey":"value",
    "period":"daily"
  }'
```

---

## 📊 What Each Test Shows

| Test | What It Tests | Success Indicator |
|------|---|---|
| **Health Check** | Server is running | Status 200 |
| **Devices** | Device management working | Device array returned |
| **Report Gen** | NEW reporting feature | Report object created |
| **Statistics** | NEW analytics engine | Avg, min, max returned |
| **Grouping** | NEW data organization | Data grouped by category |
| **Trends** | NEW trend analysis | Trend data returned |

---

## ✅ Expected Results

### If All Tests Pass ✅
- All responses show Status 200 or 201
- JSON responses are properly formatted
- No error messages
- Reports are successfully generated
- Analytics calculations are correct

**Conclusion:** ✅ All new features working perfectly!

---

### If Tests Fail ❌

#### Error: "Cannot connect to localhost:5000"
- **Solution:** Make sure backend server is running (`npm start` in backend folder)

#### Error: "Method not allowed" or 404
- **Solution:** Check if new routes are loaded (restart server if needed)

#### Error: Invalid JSON
- **Solution:** Check curly brackets and quotes in test command

#### Error: Missing authentication
- **Solution:** For protected routes, add Authorization header:
```powershell
-Headers @{"Authorization" = "Bearer YOUR_TOKEN_HERE"}
```

---

## 🎯 Full Verification Checklist

Run through these to verify everything works:

```
Quick Health Check
☐ Server responds on port 5000
☐ No connection refused errors
☐ Response time < 100ms

New Features Check
☐ Report generation endpoint works
☐ Analytics statistics work
☐ Data grouping works
☐ Trend analysis works

Data Integrity
☐ Calculations are correct
☐ Data formatting is valid
☐ No missing fields in response
☐ Error handling works

Performance
☐ Responses come back quickly (< 500ms)
☐ No timeout errors
☐ No memory issues
```

---

## 📚 For More Information

- 📖 **Full Documentation:** `START_HERE_v2.0.0.md`
- 📖 **API Reference:** `docs/API_DOCUMENTATION.md`
- 📖 **Integration Guide:** `docs/INTEGRATION_GUIDE.md`
- 📖 **Developer Reference:** `DEVELOPER_QUICK_REFERENCE.md`

---

## 🎉 Summary

You have **FOUR ways to test**:

1. **Easiest:** Run `.\Test-Features.ps1` (recommended)
2. **Manual PowerShell:** Copy-paste commands from above
3. **Git Bash:** Use curl commands from above
4. **Postman:** Import API from `docs/API_DOCUMENTATION.md`

---

**Status:** ✅ All systems ready for testing!

Start with: `.\Test-Features.ps1` 🚀
