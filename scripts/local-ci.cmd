@echo off
setlocal enabledelayedexpansion
REM ===========================================================================
REM LOCAL CI GATE — replaces GitHub Actions while the account is billing-locked
REM (and stays useful afterwards as a fast pre-push check).
REM
REM Usage:  scripts\local-ci.cmd          (full gate: lint + types + tests + build)
REM         scripts\local-ci.cmd fast     (skip the production build)
REM
REM Exit code 0 = green, anything else = DO NOT PUSH.
REM Writes a timestamped report to _local-ci\last-run.log (repo-ignored).
REM ===========================================================================

cd /d "%~dp0.."
set "ROOT=%CD%"
set "LOG=%ROOT%\_local-ci\last-run.log"
if not exist "%ROOT%\_local-ci" mkdir "%ROOT%\_local-ci"
echo LOCAL CI %date% %time% > "%LOG%"

set FAILED=0

echo [1/5] Biome (lint + format) ...
call "%ROOT%\node_modules\.bin\biome.CMD" check apps/web packages >> "%LOG%" 2>&1
if errorlevel 1 ( echo   FAILED & set FAILED=1 ) else ( echo   OK )

echo [2/5] TypeScript (apps/web) ...
pushd "%ROOT%\apps\web"
call node_modules\.bin\tsc.CMD --noEmit >> "%LOG%" 2>&1
if errorlevel 1 ( echo   FAILED & set FAILED=1 ) else ( echo   OK )
popd

echo [3/5] Unit tests apps/web ...
pushd "%ROOT%\apps\web"
call node_modules\.bin\vitest.CMD run --reporter=dot >> "%LOG%" 2>&1
if errorlevel 1 ( echo   FAILED & set FAILED=1 ) else ( echo   OK )
popd

echo [4/5] Unit tests packages ...
for %%p in (payments ai audio flow three agent mcp contracts) do (
  pushd "%ROOT%\packages\%%p"
  call node_modules\.bin\vitest.CMD run --reporter=dot >> "%LOG%" 2>&1
  if errorlevel 1 ( echo   %%p FAILED & set FAILED=1 ) else ( echo   %%p OK )
  popd
)

if /i "%~1"=="fast" (
  echo [5/5] Build skipped ^(fast mode^)
) else (
  echo [5/5] Production build apps/web ... ^(takes minutes^)
  pushd "%ROOT%\apps\web"
  call pnpm run build >> "%LOG%" 2>&1
  if errorlevel 1 ( echo   FAILED & set FAILED=1 ) else ( echo   OK )
  popd
)

echo.
if %FAILED%==1 (
  echo ============ LOCAL CI: RED — NICHT PUSHEN ============
  echo Details: %LOG%
  exit /b 1
) else (
  echo ============ LOCAL CI: GREEN — push erlaubt ============
  exit /b 0
)
