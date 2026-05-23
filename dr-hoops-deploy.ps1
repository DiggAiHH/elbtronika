# Dr. Hoops — One-Shot Deploy Bundle
# Erstellt: dr-hoops-site/ Ordner + ZIP fuer Netlify Drop
# Run: powershell -ExecutionPolicy Bypass -File dr-hoops-deploy.ps1

$ErrorActionPreference = "Stop"
$root = "D:\Elbtronika\Elbtonika"
$site = "$root\dr-hoops-site"

Write-Host "[1/5] Bereite Ordner vor..." -ForegroundColor Cyan
if (Test-Path $site) { Remove-Item -Recurse -Force $site }
New-Item -ItemType Directory -Path $site | Out-Null

Write-Host "[2/5] Kopiere dr-hoops.html -> index.html..." -ForegroundColor Cyan
Copy-Item "$root\dr-hoops.html" "$site\index.html"

Write-Host "[3/5] Schreibe netlify.toml..." -ForegroundColor Cyan
@'
# Dr. Hoops Site Config
[build]
  publish = "."
  command = ""

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), camera=(), microphone=()"
    Cache-Control = "public, max-age=300, must-revalidate"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=60, must-revalidate"
'@ | Out-File -Encoding utf8 "$site\netlify.toml"

Write-Host "[4/5] Schreibe _redirects (fuer spaeteren .de -> .art Cutover)..." -ForegroundColor Cyan
@'
# Aktuell: nur kanonisch.
# Spaeter (nach Cutover) Block aktivieren fuer 301 .de -> .art:
# https://dr-hoops.elbtronika.de/* https://dr-hoops.elbtronika.art/:splat 301!
'@ | Out-File -Encoding utf8 "$site\_redirects"

Write-Host "[5/5] Baue ZIP fuer Netlify Drop..." -ForegroundColor Cyan
$zip = "$root\dr-hoops-site.zip"
if (Test-Path $zip) { Remove-Item -Force $zip }
Compress-Archive -Path "$site\*" -DestinationPath $zip -Force

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host " Bundle ready" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host " Folder : $site"
Write-Host " ZIP    : $zip"
Write-Host ""
Write-Host " Naechster Schritt:" -ForegroundColor Yellow
Write-Host "  1. Browser oeffnen: https://app.netlify.com/drop"
Write-Host "  2. dr-hoops-site.zip rein-droppen"
Write-Host "  3. Site-Name aendern zu: dr-hoops-elbtronika"
Write-Host "  4. Domain Mgmt -> Add domain alias: dr-hoops.elbtronika.de"
Write-Host "  5. Bei deinem .de DNS:"
Write-Host "     CNAME dr-hoops -> dr-hoops-elbtronika.netlify.app"
Write-Host ""
