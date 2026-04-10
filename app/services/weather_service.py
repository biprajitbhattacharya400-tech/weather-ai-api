import requests
from app.core.config import settings

def search_cities(query: str):
    url = f"http://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={settings.WEATHER_API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return []

def get_coordinates(city: str):
    results = search_cities(city)
    if results and len(results) > 0:
        return results[0].get("lat"), results[0].get("lon")
    return None, None

from typing import Optional

def get_weather(lat: Optional[float] = None, lon: Optional[float] = None, city: Optional[str] = None):
    if lat is not None and lon is not None:
        url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={settings.WEATHER_API_KEY}&units=metric"
    elif city:
        # High Accuracy Coordinate Fallback Pipeline
        clat, clon = get_coordinates(city)
        if clat and clon:
            url = f"http://api.openweathermap.org/data/2.5/forecast?lat={clat}&lon={clon}&appid={settings.WEATHER_API_KEY}&units=metric"
        else:
            url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={settings.WEATHER_API_KEY}&units=metric"
    else:
        return {"error": "No location provided"}
        
    response = requests.get(url)

    if response.status_code != 200:
        return {"error": "Failed to fetch weather data"}

    return response.json()


def get_air_quality(lat: Optional[float], lon: Optional[float]) -> int:
    if lat is None or lon is None:
        return 42

    url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={settings.WEATHER_API_KEY}"

    try:
        response = requests.get(url, timeout=8)
        if response.status_code != 200:
            return 42

        payload = response.json()
        aqi_bucket = payload.get("list", [{}])[0].get("main", {}).get("aqi")
        if not isinstance(aqi_bucket, int):
            return 42

        # Convert OpenWeather 1-5 bucket to familiar AQI-like scale.
        bucket_map = {1: 35, 2: 75, 3: 125, 4: 175, 5: 250}
        return bucket_map.get(aqi_bucket, 42)
    except Exception:
        return 42