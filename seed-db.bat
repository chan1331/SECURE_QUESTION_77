@echo off
set "PATH=C:\Users\girid\nodejs;%PATH%"
echo ========================================================
echo Seeding Demo Accounts and Question Papers...
echo ========================================================
npm run seed
pause
