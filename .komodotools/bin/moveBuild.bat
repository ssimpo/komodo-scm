#Set path variables
set appPath=%~1\app
set fromBuildPath=%~1\app\build
set toBuildPath=%~1\build

#Run the build tool to create the xpi
"%~2" "%~3" build -d "%appPath%"

#Delete the previous build
rd /s /q "%toBuildPath%\jar"
rd /s /q "%toBuildPath%\xpi"

#Move the build extension
#The build tool creates the build in ./app/build and we want it in ./build
for /d /r "%fromBuildPath%" %%i in (*) do if exist "%toBuildPath%\%%~ni" (dir "%%i" | find "0 File(s)" > NUL & if errorlevel 1 move /y "%%i\*.*" "%toBuildPath%\%%~ni") else (move /y "%%i" "%toBuildPath%")
move /y "%fromBuildPath%\*.*" "%toBuildPath%"
rd /s /q "%fromBuildPath%"

#Delete the xpi as it is only a duplicate of the one in ./build/xpi
del /q /f "%appPath%\*.xpi"