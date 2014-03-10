rem Set path variables
set appPath=%~1\build\app
set fromBuildPath=%~1\build\app\build
set toBuildPath=%~1\build

rem Run the build tool to create the xpi
"%~2" "%~3" build -d "%appPath%"

rem Delete the previous build
rd /s /q "%toBuildPath%\jar"
rd /s /q "%toBuildPath%\xpi"

rem Move the build extension
#The build tool creates the build in ./app/build and we want it in ./build
for /d /r "%fromBuildPath%" %%i in (*) do if exist "%toBuildPath%\%%~ni" (dir "%%i" | find "0 File(s)" > NUL & if errorlevel 1 move /y "%%i\*.*" "%toBuildPath%\%%~ni") else (move /y "%%i" "%toBuildPath%")
move /y "%fromBuildPath%\*.*" "%toBuildPath%"
rd /s /q "%fromBuildPath%"

rem Delete the app path (assumes temp!)
rd /s /q "%appPath%"