@echo off
echo === elbtronika.art ===
nslookup elbtronika.art 8.8.8.8 2>&1 | findstr /R "Address: addresses:"
echo.
echo === elbtronika.diggai.de ===
nslookup elbtronika.diggai.de 8.8.8.8 2>&1 | findstr /R "Address: addresses: alias"
echo.
echo === pages.dev ===
nslookup elbtronika-art.pages.dev 8.8.8.8 2>&1 | findstr /R "Address: addresses:"
