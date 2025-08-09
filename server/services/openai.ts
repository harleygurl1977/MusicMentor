import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

interface GardeningTipRequest {
  category?: string;
  season?: string;
  skillLevel?: string;
  location?: string;
  weatherConditions?: {
    temperature: number;
    humidity: number;
    condition: string;
  };
  userPlants?: Array<{
    name: string;
    category: string;
    plantedDate: string;
  }>;
}

interface GardeningTipResponse {
  title: string;
  content: string;
  category: string;
  tags: string[];
  weatherRelevant: boolean;
}

export async function generateGardeningTip(request: GardeningTipRequest): Promise<GardeningTipResponse> {
  try {
    const {
      category = "General Gardening",
      season = "Current Season",
      skillLevel = "All Skill Levels",
      location,
      weatherConditions,
      userPlants = []
    } = request;

    const prompt = `Generate a personalized gardening tip based on the following information:

Category: ${category}
Season: ${season}
Skill Level: ${skillLevel}
Location: ${location || "General"}
Weather: ${weatherConditions ? `${weatherConditions.temperature}°F, ${weatherConditions.condition}, ${weatherConditions.humidity}% humidity` : "Not specified"}

User's Plants:
${userPlants.map(plant => `- ${plant.name} (${plant.category}, planted ${plant.plantedDate})`).join('\n')}

Please provide a practical, actionable gardening tip that is:
1. Specific to the provided context
2. Seasonally appropriate
3. Suitable for the skill level
4. Weather-conscious if weather data is provided
5. Relevant to the user's existing plants if any

Respond with JSON in this format:
{
  "title": "Short descriptive title for the tip",
  "content": "Detailed tip content with specific instructions and explanations",
  "category": "Categorize this tip (e.g., Watering, Pest Control, Planting, etc.)",
  "tags": ["array", "of", "relevant", "tags"],
  "weatherRelevant": boolean indicating if this tip is weather-dependent
}`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert gardening advisor with decades of experience in sustainable, organic gardening practices. Provide practical, actionable advice that helps gardeners succeed."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      title: result.title || "General Gardening Tip",
      content: result.content || "Focus on consistent watering and proper soil preparation for healthy plant growth.",
      category: result.category || category,
      tags: Array.isArray(result.tags) ? result.tags : [],
      weatherRelevant: Boolean(result.weatherRelevant),
    };
  } catch (error) {
    console.error("Failed to generate gardening tip:", error);
    throw new Error("Failed to generate gardening tip: " + (error as Error).message);
  }
}

export async function analyzePlantHealth(plantImage: string, plantDescription: string): Promise<{
  healthStatus: string;
  issues: string[];
  recommendations: string[];
  confidence: number;
}> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a plant pathology expert. Analyze plant images and descriptions to identify health issues and provide care recommendations."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this plant's health: ${plantDescription}. Provide a JSON response with health status, identified issues, recommendations, and confidence level.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${plantImage}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      healthStatus: result.healthStatus || "Healthy",
      issues: Array.isArray(result.issues) ? result.issues : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error("Failed to analyze plant health:", error);
    throw new Error("Failed to analyze plant health: " + (error as Error).message);
  }
}
