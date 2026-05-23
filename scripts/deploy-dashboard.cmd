@echo off
REM ELBTRONIKA — one-click Dashboard deploy
REM Idempotent: re-running ist safe. Bei jedem Lauf wird ein neuer Commit nur erzeugt, wenn etwas dirty ist.
REM Push triggert GitHub Action .github/workflows/deploy-dashboard.yml -> GitHub Pages.

setlocal ENABLEDELAYEDEXPANSION

set REPO_DIR=D:\Elbtronika\Elbtonika
cd /d "%REPO_DIR%" || (echo [ERR] cant cd %REPO_DIR% & exit /b 1)

echo === ELBTRONIKA dashboard deploy ===

REM 1. branch check
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%b
echo branch: !BRANCH!
if /i not "!BRANCH!"=="main" (
  echo [WARN] not on main, abort.
  exit /b 2
)

REM 2. pull latest
git pull --ff-only origin main || (echo [ERR] pull failed & exit /b 3)

REM 3. stage dashboard files
git add docs .github\workflows\deploy-dashboard.yml scripts\deploy-dashboard.cmd

REM 4. exit clean if nothing changed
git diff --cached --quiet
if !ERRORLEVEL!==0 (
  echo nothing to commit. clean tree. exit.
  exit /b 0
)

REM 5. write commit message to temp file (avoid quoting hell on Windows)
> D:\msg.txt echo feat(dashboard): publish worldwide GH-Pages dashboard for Hoops UI + build-status
>> D:\msg.txt echo.
>> D:\msg.txt echo - docs/index.html : single-file Tailwind dashboard, Hoops mascot, smoke-test, phase grid
>> D:\msg.txt echo - .github/workflows/deploy-dashboard.yml : auto-deploy to GH Pages on docs change
>> D:\msg.txt echo - scripts/deploy-dashboard.cmd : idempotent one-click deploy helper

git commit -F D:\msg.txt || (echo [ERR] commit failed & exit /b 4)

REM 6. push
git push origin main || (echo [ERR] push failed & exit /b 5)

echo.
echo === pushed. action will publish in ~60s. ===
echo verify:  gh run list --repo DiggAiHH/elbtronika --limit 1
echo URL  :  https://diggaihh.github.io/elbtronika/
echo.
echo first time only: GitHub repo Settings -^> Pages -^> Source = GitHub Actions

endlocal
exit /b 0
