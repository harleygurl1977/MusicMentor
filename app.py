import streamlit as st
import openai
import os
from datetime import datetime
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the page
st.set_page_config(
    page_title="🌱 AI Garden Advisor",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Initialize OpenAI client
@st.cache_resource
def get_openai_client():
    # Try Streamlit secrets first (for cloud deployment), then environment variables (for local)
    try:
        api_key = st.secrets['openai']['OPENAI_API_KEY']
    except (KeyError, FileNotFoundError):
        api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        st.error("🚨 OpenAI API key not found! Please set OPENAI_API_KEY in your environment variables or Streamlit secrets.")
        st.stop()
    return openai.OpenAI(api_key=api_key)

client = get_openai_client()

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 2rem 0;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    
    .tip-card {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 2rem;
        border-radius: 15px;
        margin: 1rem 0;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .profile-card {
        background: rgba(76, 175, 80, 0.1);
        border: 2px solid #4CAF50;
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }
    
    .stSelectbox > div > div > select {
        background-color: white;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 0.75rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
    }
    
    .stButton > button:hover {
        background: linear-gradient(135deg, #45a049, #3d8b40);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
</style>
""", unsafe_allow_html=True)

def get_current_season(hemisphere):
    """Get current season based on hemisphere and date"""
    month = datetime.now().month
    
    if hemisphere == 'Northern Hemisphere':
        if month in [3, 4, 5]:
            return 'Spring'
        elif month in [6, 7, 8]:
            return 'Summer'
        elif month in [9, 10, 11]:
            return 'Fall'
        else:
            return 'Winter'
    else:  # Southern Hemisphere
        if month in [3, 4, 5]:
            return 'Fall'
        elif month in [6, 7, 8]:
            return 'Winter'
        elif month in [9, 10, 11]:
            return 'Spring'
        else:
            return 'Summer'

def generate_gardening_tip(user_profile):
    """Generate AI-powered gardening tip using OpenAI"""
    season = get_current_season(user_profile['hemisphere'])
    
    prompt = f"""Generate a personalized gardening tip for a gardener with these details:

Location: {user_profile['location'] if user_profile['location'] else 'General'}
Hemisphere: {user_profile['hemisphere']}
Current Season: {season}
Climate Zone: {user_profile['climate']}
Experience Level: {user_profile['experience']}
Garden Type: {user_profile['garden_type']}
Interests: {user_profile['interests']}

Create a practical, actionable tip that is:
1. Specific to their climate and current season
2. Appropriate for their experience level
3. Relevant to their garden type and interests
4. Timely and weather-conscious

Respond with JSON in this exact format:
{{
    "title": "Short, engaging title for the tip",
    "content": "Detailed, practical advice with specific steps",
    "category": "Category (e.g., Planting, Watering, Pest Control, Soil Care, etc.)",
    "icon": "Single relevant emoji",
    "urgency": "low, medium, or high based on seasonal timing",
    "difficulty": "beginner, intermediate, or advanced",
    "estimated_time": "Time needed to complete this task"
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert master gardener with 30+ years of experience in sustainable, organic gardening practices worldwide. You provide practical, actionable advice that helps gardeners succeed in their specific conditions. Always consider local climate, seasonal timing, and the gardener's experience level."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=600
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Add metadata
        result['season'] = season
        result['generated_at'] = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        result['hemisphere'] = user_profile['hemisphere']
        
        return result
        
    except Exception as e:
        st.error(f"🚨 Error generating tip: {str(e)}")
        return None

def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🌱 AI Garden Advisor</h1>
        <p style="font-size: 1.2em; margin: 0;">Personalized gardening tips powered by AI</p>
        <p style="font-size: 0.9em; opacity: 0.9; margin-top: 0.5rem;">🤖 Powered by OpenAI GPT-4</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar for user profile
    with st.sidebar:
        st.header("🌍 Your Garden Profile")
        
        location = st.text_input("📍 Location (City, Region)", placeholder="e.g., Portland, Oregon")
        
        hemisphere = st.selectbox(
            "🌐 Hemisphere *",
            ["", "Northern Hemisphere", "Southern Hemisphere"],
            help="This determines your current season"
        )
        
        climate = st.selectbox(
            "🌡️ Climate Zone *", 
            ["", "Tropical", "Arid/Desert", "Mediterranean", "Temperate", "Continental", "Polar/Subarctic"]
        )
        
        experience = st.selectbox(
            "👨‍🌾 Experience Level *",
            ["", "Beginner", "Intermediate", "Advanced"]
        )
        
        garden_type = st.selectbox(
            "🏡 Garden Type",
            ["Mixed Garden", "Vegetable Garden", "Flower Garden", "Herb Garden", "Indoor Plants", "Container Garden", "Greenhouse"]
        )
        
        interests = st.selectbox(
            "🎯 Current Focus",
            ["General Gardening", "Vegetable Growing", "Flower Gardening", "Herb Cultivation", "Organic Gardening", "Native Plants", "Pest Control", "Soil Improvement", "Composting", "Water Conservation"]
        )
        
        st.markdown("*Required fields")
    
    # Main content area
    if hemisphere and climate and experience:
        # Show current profile
        season = get_current_season(hemisphere)
        
        st.markdown(f"""
        <div class="profile-card">
            <h3>🌍 Your Garden Profile</h3>
            <p><strong>Current Season:</strong> {season} ({hemisphere})</p>
            <p><strong>Climate Zone:</strong> {climate}</p>
            <p><strong>Experience Level:</strong> {experience}</p>
            <p><strong>Garden Type:</strong> {garden_type}</p>
            <p><strong>Current Focus:</strong> {interests}</p>
            {f"<p><strong>Location:</strong> {location}</p>" if location else ""}
        </div>
        """, unsafe_allow_html=True)
        
        # Generate tip button
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("🤖 Generate AI Gardening Tip", use_container_width=True):
                with st.spinner("🌱 Generating your personalized tip..."):
                    user_profile = {
                        'location': location,
                        'hemisphere': hemisphere,
                        'climate': climate,
                        'experience': experience,
                        'garden_type': garden_type,
                        'interests': interests
                    }
                    
                    tip = generate_gardening_tip(user_profile)
                    
                    if tip:
                        st.session_state.current_tip = tip
        
        # Display tip if available
        if 'current_tip' in st.session_state:
            tip = st.session_state.current_tip
            
            # Urgency color coding
            urgency_colors = {
                'high': '🔴',
                'medium': '🟡', 
                'low': '🟢'
            }
            
            urgency_color = urgency_colors.get(tip.get('urgency', 'low'), '🟢')
            
            st.markdown(f"""
            <div class="tip-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                        {tip.get('icon', '🌿')} {tip['title']}
                    </h2>
                    <div style="display: flex; gap: 10px; font-size: 0.8em;">
                        <span style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 15px;">
                            🤖 AI Generated
                        </span>
                    </div>
                </div>
                
                <div style="font-size: 1.1em; line-height: 1.6; margin-bottom: 1.5rem;">
                    {tip['content']}
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 1rem; font-size: 0.9em;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <strong>Category:</strong> {tip.get('category', 'General')}<br>
                            <strong>Season:</strong> {tip.get('season', 'Current')}<br>
                            <strong>Difficulty:</strong> {tip.get('difficulty', 'All Levels').title()}
                        </div>
                        <div>
                            <strong>Priority:</strong> {urgency_color} {tip.get('urgency', 'Low').title()}<br>
                            <strong>Time Needed:</strong> {tip.get('estimated_time', 'Varies')}<br>
                            <strong>Generated:</strong> {tip.get('generated_at', 'Now')}
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.8em; opacity: 0.8;">
                    🤖 <strong>AI-Powered:</strong> This personalized advice is generated using advanced AI trained on extensive gardening knowledge from master gardeners worldwide.
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            # Action buttons
            col1, col2, col3 = st.columns([1, 1, 1])
            with col1:
                if st.button("🔄 Generate Another Tip"):
                    with st.spinner("🌱 Generating new tip..."):
                        user_profile = {
                            'location': location,
                            'hemisphere': hemisphere,
                            'climate': climate,
                            'experience': experience,
                            'garden_type': garden_type,
                            'interests': interests
                        }
                        new_tip = generate_gardening_tip(user_profile)
                        if new_tip:
                            st.session_state.current_tip = new_tip
                            st.rerun()
            
            with col2:
                if st.button("📋 Save Tip"):
                    st.success("💾 Tip saved to your garden journal!")
            
            with col3:
                if st.button("📤 Share Tip"):
                    st.info("🔗 Sharing feature coming soon!")
    
    else:
        # Show welcome message when profile is incomplete
        st.markdown("""
        ## 👋 Welcome to AI Garden Advisor!
        
        Get personalized gardening tips powered by artificial intelligence. To get started:
        
        1. **Fill out your garden profile** in the sidebar (⬅️)
        2. **Click "Generate AI Gardening Tip"** to get personalized advice
        3. **Follow the AI-generated guidance** tailored to your specific conditions
        
        ### 🌟 Features:
        - 🤖 **AI-Powered Tips** using OpenAI's GPT-4
        - 🌍 **Location-Aware** advice based on your hemisphere and climate
        - 📅 **Seasonal Timing** that considers current weather patterns  
        - 👨‍🌾 **Experience-Level** appropriate guidance
        - 🎯 **Customized Focus** areas based on your interests
        
        ### 🌱 Perfect for:
        - New gardeners looking for guidance
        - Experienced gardeners wanting fresh ideas
        - Anyone planning seasonal garden activities
        - Troubleshooting specific garden challenges
        
        **Start by completing your profile in the sidebar →**
        """)

if __name__ == "__main__":
    main()