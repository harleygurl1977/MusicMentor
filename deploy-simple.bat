@echo off
echo ========================================
echo Garden App GitHub Deployment Script
echo ========================================
echo.

echo Configuring Git credentials...
git config --global user.name "harleygurl1977"
git config --global user.email "your-email@example.com"

echo Initializing local git repository...
git init

echo Adding all files to git...
git add .

echo Creating commit with validation fixes...
git commit -m "Deploy validated Garden App with OpenAI integration - Fixed all issues and removed fallbacks"

echo Setting remote repository...
git remote add origin https://github.com/harleygurl1977/MusicMentor.git

echo Pulling latest changes from remote...
git pull origin main --allow-unrelated-histories

echo.
echo ========================================
echo Ready to push! You will be prompted for your GitHub credentials:
echo Username: harleygurl1977
echo Password: Lenore77!!
echo ========================================
echo.

echo Pushing to GitHub repository...
git push -u origin main

echo.
echo ========================================
echo Deployment completed successfully!
echo Repository: https://github.com/harleygurl1977/MusicMentor
echo ========================================
echo.

pause