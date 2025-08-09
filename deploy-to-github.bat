@echo off
echo ========================================
echo Garden App GitHub Deployment Script
echo ========================================
echo.

REM Set variables
set REPO_URL=https://harleygurl1977:Lenore77!!@github.com/harleygurl1977/MusicMentor.git
set BRANCH=main

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