from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def generate_llm_insight(city, temp, condition):
    try:
        prompt = f"""
You are a weather assistant.

City: {city}
Temperature: {temp}°C
Condition: {condition}

Give a SHORT (1 sentence) practical recommendation for a user.
No greetings. No extra explanation.
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"LLM error: {str(e)}"