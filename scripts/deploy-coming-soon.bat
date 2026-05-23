@echo off
setlocal
pushd D:\Elbtronika\Elbtonika
echo CWD: %CD%
set "CLOUDFLARE_ACCOUNT_ID=6abb3679bb27b6d7182ab01d290a3aeb"
call wrangler pages deploy "%CD%\apps\web-coming-soon" --project-name=elbtronika-art --branch=main --commit-dirty=true
popd
