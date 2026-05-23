@echo off
dir /B /S "C:\Users\Moin\.wrangler" 2>nul | findstr /V logs | findstr /V tmp
