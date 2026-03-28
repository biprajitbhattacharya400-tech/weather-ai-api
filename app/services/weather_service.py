import requests
from app.core.config import settings

def get_weather(city: str):
    url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={settings.WEATHER_API_KEY}&units=metric"
    
    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "Failed to fetch weather data"}

    return response.json()