@call setlocal
@call hg clone ../ ../clones/%1
@call cd ../clones/%1/bin
@call install.bat