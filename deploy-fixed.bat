@echo off
echo ========================================
echo Garden App GitHub Deployment Script
echo Using Personal Access Token
echo ========================================
echo.

REM Clear any existing Git credentials
git config --global --unset user.name
git config --global --unset user.email

REM Set correct Git credentials
git config --global user.name "harleygurl1977"
git config --global user.email "harleygurl1977@example.com"

REM Personal Access Token configured
set USERNAME=harleygurl1977
set TOKEN=YOUR_GITHUB_TOKEN_HERE
set REPO_URL=https://%USERNAME%:%TOKEN%@github.com/harleygurl1977/MusicMentor.git
set BRANCH=main

echo Current Git user:
git config user.name
git config user.email

echo.
echo Removing existing remote...
git remote remove origin

echo Adding remote repository with token...
git remote add origin %REPO_URL%

echo Creating simple commit...
git add .
git commit -m "Deploy validated Garden App with OpenAI integration and fixes"

echo Pushing to GitHub repository...
git push -u origin %BRANCH%

echo.
echo ========================================
echo Deployment completed!
echo Repository: https://github.com/harleygurl1977/MusicMentor
echo ========================================
echo.

pause