interface WeatherApiResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

export async function getWeatherData(location: string): Promise<{
  temperature: number;
  humidity: number;
  condition: string;
  description: string;
  icon: string;
  location: string;
} | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "default_key";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=fahrenheit`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: WeatherApiResponse = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name,
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return null;
  }
}

export function getGardeningRecommendations(temperature: number, humidity: number, condition: string): {
  watering: string;
  planting: string;
  general: string;
} {
  let watering = "Water normally";
  let planting = "Good conditions for most activities";
  let general = "Perfect weather for gardening";

  // Temperature-based recommendations
  if (temperature > 85) {
    watering = "Water early morning or evening to avoid evaporation";
    planting = "Avoid planting during hot afternoon hours";
    general = "Provide shade for sensitive plants";
  } else if (temperature < 50) {
    watering = "Reduce watering frequency";
    planting = "Wait for warmer weather for most planting";
    general = "Protect plants from frost";
  } else if (temperature >= 65 && temperature <= 75) {
    watering = "Ideal watering conditions";
    planting = "Perfect time for planting most vegetables and flowers";
    general = "Excellent weather for all garden activities";
  }

  // Weather condition adjustments
  if (condition.toLowerCase().includes('rain')) {
    watering = "Skip watering today - natural rainfall is sufficient";
    general = "Great for established plants, check drainage for potted plants";
  } else if (condition.toLowerCase().includes('sun')) {
    if (temperature > 80) {
      watering = "Water deeply in early morning";
      general = "Provide afternoon shade for delicate plants";
    }
  } else if (condition.toLowerCase().includes('cloud')) {
    watering = "Good conditions for watering without quick evaporation";
    planting = "Overcast conditions are gentle for new plantings";
  }

  // Humidity adjustments
  if (humidity > 70) {
    general += ". Watch for fungal diseases in humid conditions";
  } else if (humidity < 30) {
    watering = "Increase watering frequency in low humidity";
    general += ". Plants may need extra water in dry air";
  }

  return { watering, planting, general };
}
