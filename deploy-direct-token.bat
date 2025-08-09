@echo off
echo ========================================
echo Garden App GitHub Deployment Script
echo Using Token Directly in URL
echo ========================================
echo.

REM Clear any cached credentials first
git config --global --unset credential.helper >nul 2>&1
git config --global user.name "harleygurl1977"
git config --global user.email "harleygurl1977@example.com"

echo Git user configured as: 
git config user.name

REM Remove existing remote
git remote remove origin >nul 2>&1

REM Add remote with token embedded directly in URL
echo Adding remote with embedded token...
git remote add origin https://harleygurl1977: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@github.com/harleygurl1977/MusicMentor.git

echo Adding and committing files...
git add .
git commit -m "Deploy validated Garden App"

echo Pushing directly with embedded token...
git push -u origin main

echo.
echo ========================================
echo Deployment completed!
echo ========================================
echo.

pause