from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.weather import WeatherLog
from app.services.weather_service import get_weather
from app.services.insight_engine import generate_insights
from fastapi import Query

router = APIRouter()

@router.get("/weather/compare")
def compare_weather(cities: str = Query(...), db: Session = Depends(get_db)):
    
    city_list = [city.strip() for city in cities.split(",")]
    result = {}

    for city in city_list:
        data = get_weather(city)

        print("DEBUG:", city, data)  # keep for now

        # FIXED VALIDATION
        if not data or str(data.get("cod")) != "200" or "list" not in data:
            result[city] = {"error": f"Could not fetch weather for {city}"}
            continue

        try:
            first = data["list"][0]

            insights = generate_insights(data)

            # Save to DB
            weather_log = WeatherLog(
                city=city,
                temperature=first["main"]["temp"],
                condition=first["weather"][0]["main"]
            )
            db.add(weather_log)

            result[city] = {
                "temperature": first["main"]["temp"],
                "condition": first["weather"][0]["main"],
                "insights": insights
            }

        except Exception as e:
            result[city] = {"error": str(e)}

    db.commit()

    return result


@router.get("/weather/{city}")
def weather(city: str, db: Session = Depends(get_db)):
    data = get_weather(city)

    if str(data.get("cod")) != "200":
        return {"error": "Could not fetch weather"}

    insights = generate_insights(data)

    # Save first forecast data
    first = data["list"][0]

    weather_log = WeatherLog(
        city=city,
        temperature=first["main"]["temp"],
        condition=first["weather"][0]["main"]
    )

    db.add(weather_log)
    db.commit()

    return {
        "city": city,
        "insights": insights,
        "data": data["list"][:3]
    }



@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    records = db.query(WeatherLog).all()

    return [
        {
            "id": record.id,
            "city": record.city,
            "temperature": record.temperature,
            "condition": record.condition
        }
        for record in records
    ]



# from fastapi import Query

