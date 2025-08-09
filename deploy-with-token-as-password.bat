@echo off
echo ========================================
echo Garden App GitHub Deployment Script
echo Using Personal Access Token as Password
echo ========================================
echo.

REM Force clear ALL git credentials
echo Clearing cached credentials...
cmdkey /delete:git:https://github.com >nul 2>&1
git config --global --unset credential.helper >nul 2>&1
git config --global --unset user.name >nul 2>&1
git config --global --unset user.email >nul 2>&1

REM Set the correct user credentials
echo Setting Git user to harleygurl1977...
git config --global user.name "harleygurl1977"
git config --global user.email "harleygurl1977@example.com"
git config --global credential.helper ""

echo Current Git configuration:
git config --global user.name
git config --global user.email

REM Remove existing remote and add fresh one
echo Configuring remote repository...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/harleygurl1977/MusicMentor.git

REM Add and commit files
echo Adding files and creating commit...
git add .
git commit -m "Deploy validated Garden App with OpenAI fixes"

echo.
echo ========================================
echo About to push to GitHub...
echo When prompted for credentials:
echo Username: harleygurl1977
echo Password: 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
echo (Use your Personal Access Token as the password)
echo ========================================
echo.

REM Push with explicit credential request
git push -u origin main

echo.
echo ========================================
echo Deployment completed!
echo Repository: https://github.com/harleygurl1977/MusicMentor
echo ========================================
echo.

pause