@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python is required to preview this website.
  echo Install Python, or upload the website to a static web host.
  pause
  exit /b 1
)
echo Open this address in your browser:
echo http://127.0.0.1:4175/
echo Keep this window open while previewing. Press Ctrl+C to stop.
python -m http.server 4175 --bind 127.0.0.1
pause
