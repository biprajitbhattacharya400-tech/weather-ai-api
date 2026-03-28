from fastapi import APIRouter
from app.services.weather_service import get_weather
from app.services.insight_engine import generate_insights

router = APIRouter()

@router.get("/weather/{city}")
def weather(city: str):
    data = get_weather(city)

    if "error" in data:
        return {"error": "Could not fetch weather"}

    insights = generate_insights(data)

    return {
        "city": city,
        "insights": insights,
        "data": data["list"][:3]
    }