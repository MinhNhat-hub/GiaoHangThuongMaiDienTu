@echo off
chcp 65001 >nul
title GiaoHang - login test
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 18 or newer from https://nodejs.org, then run start.bat again.
  pause
  exit /b 1
)
if not defined OPEN_BROWSER set OPEN_BROWSER=1
node server\server.mjs
pause
