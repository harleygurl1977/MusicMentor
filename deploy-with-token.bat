@echo off
echo ========================================
echo Garden App GitHub Deployment Script
echo Using Personal Access Token
echo ========================================
echo.

REM Personal Access Token configured
set USERNAME=harleygurl1977
set TOKEN=YOUR_GITHUB_TOKEN_HERE
set REPO_URL=https://%USERNAME%:%TOKEN%@github.com/harleygurl1977/MusicMentor.git
set BRANCH=main

echo Configuring Git credentials...
git config --global user.name "harleygurl1977"
git config --global user.email "harleygurl1977@example.com"

echo Initializing local git repository...
git init

echo Adding all files to git...
git add .

echo Creating commit with validation fixes...
git commit -m "🌱 Deploy validated Garden App with OpenAI integration

✅ Fixed OpenAI API key configuration with lazy initialization
✅ Removed weather service fallbacks (no dummy data)  
✅ Fixed TypeScript type errors in storage and auth
✅ Added dotenv configuration for environment variables
✅ Fixed null safety issues in database operations
✅ Ensured all external APIs require valid keys

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

echo Setting remote repository...
git remote add origin %REPO_URL%

echo Pulling latest changes from remote...
git pull origin %BRANCH% --allow-unrelated-histories

echo Pushing to GitHub repository...
git push -u origin %BRANCH%

echo.
echo ========================================
echo Deployment completed successfully!
echo Repository: https://github.com/harleygurl1977/MusicMentor
echo ========================================
echo.

pause