# 🌱 AI Garden Advisor

A beautiful, AI-powered gardening assistant that provides personalized gardening tips using OpenAI's GPT-4.

## ✨ Features

- 🤖 **AI-Powered Tips** using OpenAI GPT-4
- 🌍 **Location-Aware** advice based on hemisphere and climate
- 📅 **Seasonal Intelligence** that considers current timing
- 👨‍🌾 **Experience-Appropriate** guidance for all skill levels
- 🎯 **Customizable Focus** areas based on your interests
- 📱 **Mobile-Responsive** design that works on any device
- 🎨 **Beautiful Interface** built with Streamlit

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone or download** this folder
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to `.env`
4. **Run the app**:
   ```bash
   streamlit run app.py
   ```
5. **Open your browser** to `http://localhost:8501`

### Option 2: Deploy to Streamlit Cloud

1. **Push to GitHub** (without the `.env` file)
2. **Go to** [share.streamlit.io](https://share.streamlit.io)
3. **Deploy** your GitHub repository
4. **Add secrets** in Streamlit Cloud settings:
   - `OPENAI_API_KEY` = your OpenAI API key

### Option 3: Deploy to Replit

1. **Import** this folder to Replit
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Set environment variable**: `OPENAI_API_KEY` in Replit Secrets
4. **Run**: `streamlit run app.py --server.port 8080 --server.address 0.0.0.0`

## 🌟 How It Works

1. **Complete your garden profile** in the sidebar
2. **Generate AI tips** tailored to your specific conditions
3. **Follow personalized advice** based on:
   - Your location and climate zone
   - Current season in your hemisphere
   - Your experience level
   - Garden type and interests
   - Seasonal timing and urgency

## 🔧 Configuration

### Required Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)

### Supported Climates

- Tropical (Hot, humid year-round)
- Arid/Desert (Hot, dry)
- Mediterranean (Mild winters, dry summers)
- Temperate (Four distinct seasons)
- Continental (Cold winters, warm summers)
- Polar/Subarctic (Very cold)

### Garden Types

- Mixed Garden
- Vegetable Garden
- Flower Garden
- Herb Garden
- Indoor Plants
- Container Garden
- Greenhouse

## 📱 Screenshots

The app features:
- Clean, professional interface
- Responsive design for mobile and desktop
- Beautiful gradient styling
- Intuitive sidebar configuration
- Rich, detailed AI-generated tips

## 🤖 AI-Powered Intelligence

Each tip includes:
- **Personalized advice** based on your profile
- **Seasonal timing** appropriate for your hemisphere
- **Difficulty level** matching your experience
- **Time estimates** for completing tasks
- **Priority levels** (high/medium/low urgency)
- **Category classification** for organization

## 🔒 Privacy & Security

- No data is stored or transmitted except to OpenAI for tip generation
- Your profile information stays in your browser session
- OpenAI API calls are secure and encrypted
- No personal information is logged or stored

## 🌱 Perfect For

- **New gardeners** looking for step-by-step guidance
- **Experienced gardeners** wanting fresh, AI-generated ideas
- **Seasonal planning** for optimal garden timing
- **Climate-specific advice** for challenging conditions
- **Troubleshooting** specific garden challenges

## 📄 License

MIT License - feel free to use and modify for your own projects!

---

**Happy Gardening! 🌱🤖**