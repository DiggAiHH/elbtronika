# ELBTRONIKA — Dev Tools Installer (Windows)
# Run from PowerShell as Administrator if winget requires elevation
# Usage: .\scripts\install-dev-tools.ps1

param(
    [switch]$SkipSupabase,
    [switch]$SkipDoppler
)

$ErrorActionPreference = "Stop"
Write-Host "=== ELBTRONIKA Dev Tools Installer ===" -ForegroundColor Cyan
Write-Host ""

# --- Supabase CLI ---
if (-not $SkipSupabase) {
    Write-Host "[1/2] Installing Supabase CLI..." -ForegroundColor Yellow
    
    $supabase = Get-Command supabase -ErrorAction SilentlyContinue
    if ($supabase) {
        Write-Host "  Supabase CLI already installed: $($supabase.Source)" -ForegroundColor Green
        & supabase --version
    } else {
        # Try winget first
        $winget = Get-Command winget -ErrorAction SilentlyContinue
        if ($winget) {
            try {
                Write-Host "  Attempting winget install..." -ForegroundColor DarkGray
                winget install Supabase.CLI --accept-source-agreements --accept-package-agreements
                Write-Host "  Supabase CLI installed via winget." -ForegroundColor Green
            } catch {
                Write-Host "  winget failed. Falling back to manual download..." -ForegroundColor DarkYellow
                $url = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.tar.gz"
                $tmp = "$env:TEMP\supabase_cli"
                New-Item -ItemType Directory -Force -Path $tmp | Out-Null
                Invoke-WebRequest -Uri $url -OutFile "$tmp\supabase.tar.gz"
                tar -xzf "$tmp\supabase.tar.gz" -C $tmp
                $dest = "$env:LOCALAPPDATA\Microsoft\WindowsApps"
                Copy-Item "$tmp\supabase.exe" $dest -Force
                Write-Host "  Supabase CLI installed to $dest" -ForegroundColor Green
            }
        } else {
            Write-Host "  ERROR: Neither winget nor manual download available." -ForegroundColor Red
            Write-Host "  Please install manually: https://supabase.com/docs/guides/cli/getting-started"
        }
    }
    Write-Host ""
}

# --- Doppler CLI ---
if (-not $SkipDoppler) {
    Write-Host "[2/2] Installing Doppler CLI..." -ForegroundColor Yellow
    
    $doppler = Get-Command doppler -ErrorAction SilentlyContinue
    if ($doppler) {
        Write-Host "  Doppler CLI already installed: $($doppler.Source)" -ForegroundColor Green
        & doppler --version
    } else {
        $winget = Get-Command winget -ErrorAction SilentlyContinue
        if ($winget) {
            try {
                Write-Host "  Attempting winget install..." -ForegroundColor DarkGray
                winget install Doppler.doppler --accept-source-agreements --accept-package-agreements
                Write-Host "  Doppler CLI installed via winget." -ForegroundColor Green
            } catch {
                Write-Host "  winget failed. Falling back to manual download..." -ForegroundColor DarkYellow
                $url = "https://github.com/DopplerHQ/cli/releases/latest/download/doppler_3.71.0_windows_amd64.zip"
                $tmp = "$env:TEMP\doppler_cli"
                New-Item -ItemType Directory -Force -Path $tmp | Out-Null
                Invoke-WebRequest -Uri $url -OutFile "$tmp\doppler.zip"
                Expand-Archive "$tmp\doppler.zip" -DestinationPath $tmp -Force
                $dest = "$env:LOCALAPPDATA\Microsoft\WindowsApps"
                Copy-Item "$tmp\doppler.exe" $dest -Force
                Write-Host "  Doppler CLI installed to $dest" -ForegroundColor Green
            }
        } else {
            Write-Host "  ERROR: Neither winget nor manual download available." -ForegroundColor Red
            Write-Host "  Please install manually: https://docs.doppler.com/docs/install-cli"
        }
    }
    Write-Host ""
}

Write-Host "=== Done ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Restart your terminal (or run `refreshenv` if using Chocolatey)" -ForegroundColor DarkGray
Write-Host "  2. Verify: supabase --version" -ForegroundColor DarkGray
Write-Host "  3. Verify: doppler --version" -ForegroundColor DarkGray
Write-Host "  4. Login: supabase login" -ForegroundColor DarkGray
Write-Host "  5. Login: doppler login" -ForegroundColor DarkGray
Write-Host ""
