def generate_insights(data):
    insights = []

    temps = [item["main"]["temp"] for item in data["list"]]
    weather_conditions = [item["weather"][0]["main"] for item in data["list"]]
    rain_volumes = [item.get("rain", {}).get("3h", 0) for item in data["list"]]

    avg_temp = sum(temps) / len(temps)

    # 🌧️ Rain detection
    if "Rain" in weather_conditions:
        if max(rain_volumes) > 20:
            insights.append("⛈️ Heavy rain expected. Avoid going out.")
        else:
            insights.append("🌧️ Light rain expected. Carry an umbrella.")

    # 🔥 Heat
    if avg_temp > 35:
        insights.append("🔥 Heatwave alert. Stay hydrated.")

    # ❄️ Cold
    if avg_temp < 15:
        insights.append("❄️ Cold weather. Wear warm clothes.")

    # 🌤️ Pleasant
    if 20 <= avg_temp <= 30 and "Rain" not in weather_conditions:
        insights.append("🌤️ Pleasant weather. Good time to go outside.")

    return insights