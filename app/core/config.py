from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    def __init__(self):
        self.WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY")

settings = Settings()