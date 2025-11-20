@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
pushd "%ROOT%" >nul

set "VERSION=%~1"
if "%VERSION%"=="" (
    for /f "usebackq delims=" %%i in (`node -e "const v=require('./package.json').version||'0.0.0';const parts=String(v).split('.').map(n=>parseInt(n,10)||0);while(parts.length<3)parts.push(0);parts[2]+=1;console.log(parts.slice(0,3).join('.'));"`) do set "SUGGESTED=%%i"
    if not defined SUGGESTED set "SUGGESTED=0.0.1"
    set /p "VERSION=Enter new version [!SUGGESTED!]: "
    if "!VERSION!"=="" (
        set "VERSION=!SUGGESTED!"
        echo Using suggested version !VERSION!.
    )
)

if "%VERSION%"=="" (
    echo Could not determine a version. Aborting.
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
