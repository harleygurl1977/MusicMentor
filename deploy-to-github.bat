@echo off
echo ========================================
echo Deploy AI Garden Advisor to GitHub
echo ========================================
echo.

REM Configure git
git config --global user.name "harleygurl1977"
git config --global user.email "harleygurl1977@example.com"

REM Initialize git in this subfolder if needed
if not exist ".git" (
    echo Initializing git repository...
    git init
)

REM Remove existing remote if it exists
git remote remove origin >nul 2>&1

REM Add remote with token
echo Adding GitHub remote...
git remote add origin https://harleygurl1977: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@github.com/harleygurl1977/MusicMentor.git

REM Add all files except .env (which contains the real API key)
echo Adding files to git...
echo .env >> .gitignore
echo __pycache__/ >> .gitignore
echo *.pyc >> .gitignore
echo .streamlit/ >> .gitignore

git add .
git add .gitignore

echo Creating commit...
git commit -m "🌱 Deploy Beautiful AI Garden Advisor

✨ Features:
- Beautiful Streamlit interface with professional styling
- Real OpenAI GPT-4 integration for personalized tips
- Location-aware seasonal advice
- Climate zone and experience level customization
- Mobile-responsive design
- No database required - fully stateless

🚀 Ready for deployment:
- Streamlit Cloud: share.streamlit.io
- Replit: Just import and set OPENAI_API_KEY
- Local: streamlit run app.py

🤖 Generated with Claude Code"

echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo SUCCESS! AI Garden Advisor deployed
echo Repository: https://github.com/harleygurl1977/MusicMentor
echo ========================================
echo.
echo Next steps:
echo 1. Deploy to Streamlit Cloud at share.streamlit.io
echo 2. Add OPENAI_API_KEY in secrets
echo 3. Your app will be live instantly!
echo.
echo Or import to Replit and set environment variable
echo.

pause