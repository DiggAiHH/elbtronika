@echo off
pushd D:\Elbtronika\Elbtonika
node scripts\cf-api-call.mjs GET "/zones?per_page=50"
popd
