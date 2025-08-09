@echo off
echo ========================================
echo 🌱 AI Garden Advisor
echo ========================================
echo.
echo Starting the app...
echo Open your browser to: http://localhost:8501
echo.
echo Press Ctrl+C to stop the app
echo.

cd /d "%~dp0"
streamlit run app.py --server.headless true --server.port 8501 --server.address 0.0.0.0

pause