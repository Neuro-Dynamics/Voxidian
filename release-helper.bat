@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
pushd "%ROOT%" >nul

set "VERSION=%~1"
if "%VERSION%"=="" (
    set /p VERSION=Enter new version (e.g. 0.1.7):
)

if "%VERSION%"=="" (
    echo No version provided. Aborting.
    popd
    exit /b 1
)

echo Updating version to %VERSION%...
node "%ROOT%scripts\sync-version.js" "%VERSION%"
if errorlevel 1 (
    echo Version sync failed.
    popd
    exit /b 1
)

echo Running npm run build...
npm run build
if errorlevel 1 (
    echo Build failed.
    popd
    exit /b 1
)

for /f "usebackq tokens=*" %%i in (`node -e "console.log(require('./package.json').version)"`) do set "CURRENT_VERSION=%%i"
echo Current version: %CURRENT_VERSION%

popd
endlocal
exit /b 0
