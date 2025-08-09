"""
Deployment script for AI Garden Advisor
"""
import subprocess
import os
import sys

def check_requirements():
    """Check if required packages are installed"""
    try:
        import streamlit
        import openai
        from dotenv import load_dotenv
        print("✅ All required packages are installed!")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("Installing requirements...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        return True

def check_env():
    """Check if environment variables are set"""
    from dotenv import load_dotenv
    load_dotenv()
    
    if os.getenv('OPENAI_API_KEY'):
        print("✅ OpenAI API key is configured!")
        return True
    else:
        print("❌ OpenAI API key not found!")
        print("Please set OPENAI_API_KEY in your .env file")
        return False

def run_app():
    """Run the Streamlit app"""
    print("🚀 Starting AI Garden Advisor...")
    subprocess.run([
        sys.executable, "-m", "streamlit", "run", "app.py",
        "--server.headless", "true",
        "--server.port", "8501",
        "--server.address", "0.0.0.0"
    ])

def main():
    print("🌱 AI Garden Advisor Deployment")
    print("=" * 40)
    
    if not check_requirements():
        return
    
    if not check_env():
        return
    
    run_app()

if __name__ == "__main__":
    main()