rem Set path variables
set fromBuildPath=%~1\app
set toBuildPath=%~1\build\app

xcopy /y /i /e %fromBuildPath% %toBuildPath%