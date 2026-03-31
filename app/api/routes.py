from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.weather import WeatherLog
from app.services.weather_service import get_weather
from app.services.llm_service import generate_llm_insight  # NEW
from app.services.cache_service import get_cache, set_cache

router = APIRouter()


# 🌍 MULTI-CITY COMPARE
@router.get("/weather/compare")
def compare_weather(cities: str = Query(...), db: Session = Depends(get_db)):
    
    city_list = [c.strip().lower() for c in cities.split(",")]
    result = {}
    
    # Map unsupported local names to the nearest supported API hub
    alias_map = {
        "kadamtala": "dharmanagar",
        "kadamtala north tripura": "dharmanagar",
        "kadamtala tripura": "dharmanagar"
    }

    for original_city in city_list:
        query_city = alias_map.get(original_city, original_city)
        display_city = original_city.title()
        
        data = get_weather(query_city)

        if not data or str(data.get("cod")) != "200" or "list" not in data:
            result[display_city] = {"error": f"Could not fetch weather for {display_city}"}
            continue

        try:
            first = data["list"][0]

            # 🤖 LLM INSIGHT
            llm_insight = generate_llm_insight(
                display_city,
                first["main"]["temp"],
                first["weather"][0]["main"]
            )

            # Save to DB
            weather_log = WeatherLog(
                city=display_city,
                temperature=first["main"]["temp"],
                condition=first["weather"][0]["main"]
            )
            db.add(weather_log)

            result[display_city] = {
                "temperature": first["main"]["temp"],
                "condition": first["weather"][0]["main"],
                "insight": llm_insight  # UPDATED
            }

        except Exception as e:
            result[display_city] = {"error": str(e)}

    db.commit()

    return result






# 🌤️ SINGLE CITY
@router.get("/weather/{city}")
def weather(city: str, db: Session = Depends(get_db)):

    city = city.strip().lower()
    city = city.replace('"', '').replace("'", "")

    # Map unsupported local names to the nearest supported API hub
    alias_map = {
        "kadamtala": "dharmanagar",
        "kadamtala north tripura": "dharmanagar",
        "kadamtala tripura": "dharmanagar"
    }
    
    display_city = city.title()
    query_city = alias_map.get(city, city)

    cache_key = f"weather:{query_city}"

    # 🔁 Check cache
    cached_data = get_cache(cache_key)
    if cached_data:
        print("CACHE HIT")
        cached_data["city"] = display_city # Force cache to show desired name
        return cached_data

    # 🌐 Fetch weather
    data = get_weather(query_city)

    if not data or data.get("cod") not in [200, "200"]:
        return {"error": "Could not fetch weather", "raw": data}

    first = data["list"][0]

    # 🤖 LLM insight
    insight = generate_llm_insight(
        display_city,
        first["main"]["temp"],
        first["weather"][0]["main"]
    )

    # 💾 Save to DB
    weather_log = WeatherLog(
        city=display_city,
        temperature=first["main"]["temp"],
        condition=first["weather"][0]["main"]
    )

    db.add(weather_log)
    db.commit()

    response = {
        "city": display_city,
        "temperature": first["main"]["temp"],
        "feels_like": first["main"].get("feels_like", first["main"]["temp"]),
        "humidity": first["main"].get("humidity", 0),
        "pressure": first["main"].get("pressure", 0),
        "wind_speed": first.get("wind", {}).get("speed", 0),
        "visibility": first.get("visibility", 10000),
        "condition": first["weather"][0]["main"],
        "insight": insight,
        "forecast": [
            {
                "time": item["dt_txt"],
                "temperature": item["main"]["temp"],
                "condition": item["weather"][0]["main"]
            }
            for item in data.get("list", [])[:8]
        ]
    }

    # ⚡ Cache it
    set_cache(cache_key, response)

    return response





# 📜 HISTORY
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




@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):

    records = db.query(WeatherLog).all()

    if not records:
        return {"message": "No data available"}

    city_count = {}
    city_temp = {}

    for record in records:
        city = record.city

        # count
        city_count[city] = city_count.get(city, 0) + 1

        # temperature sum
        if city not in city_temp:
            city_temp[city] = []
        city_temp[city].append(record.temperature)

    # Most searched city
    most_searched = max(city_count, key=city_count.get)

    # Average temperature
    avg_temp = {
        city: round(sum(temps) / len(temps), 2)
        for city, temps in city_temp.items()
    }

    return {
        "most_searched_city": most_searched,
        "request_count": city_count,
        "average_temperature": avg_temp
    }