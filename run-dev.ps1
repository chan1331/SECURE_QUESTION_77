$env:PATH = "C:\Users\girid\nodejs;" + $env:PATH
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting SC-QPMS Security Platform Development Server..." -ForegroundColor Green
Write-Host "Local URL: http://localhost:3000" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
npm run dev
