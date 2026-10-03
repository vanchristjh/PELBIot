# PowerShell script to set up MySQL database
# This script connects to MySQL and creates the pelbiot database

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$sqlFile = "setup_database.sql"

Write-Host "`n🔧 PELBIOT Database Setup Script`n" -ForegroundColor Cyan
Write-Host "This script will create the pelbiot database and import the schema.`n" -ForegroundColor White

# Check if mysql.exe exists
if (-Not (Test-Path $mysqlPath)) {
    Write-Host "❌ MySQL not found at: $mysqlPath" -ForegroundColor Red
    Write-Host "Please install MySQL or check the path.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL found at: $mysqlPath`n" -ForegroundColor Green

# Check if SQL file exists
if (-Not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile`n" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SQL file found: $sqlFile`n" -ForegroundColor Green

# Read the SQL file
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "📋 SQL Commands to execute:`n" -ForegroundColor Cyan
Write-Host $sqlContent | Select-Object -First 20
Write-Host "`n... (showing first 20 lines)`n" -ForegroundColor Gray

Write-Host "🔑 You'll be prompted for your MySQL root password next.`n" -ForegroundColor Yellow
Write-Host "Note: As you type the password, nothing will appear (this is normal).`n" -ForegroundColor Gray

# Try to execute using mysql.exe
try {
    # Use @' '@ for multi-line strings in PowerShell
    $process = Start-Process -FilePath $mysqlPath `
        -ArgumentList "-u root -p" `
        -NoNewWindow `
        -Wait `
        -PassThru `
        -RedirectStandardInput $sqlFile `
        -RedirectStandardOutput "mysql_output.txt" `
        -RedirectStandardError "mysql_error.txt"
    
    Write-Host "`n✅ Command executed. Checking results...`n" -ForegroundColor Green
    
    # Show output
    if (Test-Path "mysql_output.txt") {
        $output = Get-Content "mysql_output.txt"
        Write-Host "📋 Output:`n" -ForegroundColor Cyan
        Write-Host $output -ForegroundColor White
    }
    
    # Show errors if any
    if (Test-Path "mysql_error.txt") {
        $errors = Get-Content "mysql_error.txt"
        if ($errors) {
            Write-Host "⚠️  Errors:`n" -ForegroundColor Yellow
            Write-Host $errors -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error: $_`n" -ForegroundColor Red
}

Write-Host "`n💡 Tip: If you get a password prompt error, try running MySQL Workbench instead:`n" -ForegroundColor Yellow
Write-Host "1. Open MySQL Workbench`n" -ForegroundColor Gray
Write-Host "2. File → Open SQL Script → setup_database.sql`n" -ForegroundColor Gray
Write-Host "3. Click Execute (lightning bolt)`n" -ForegroundColor Gray
