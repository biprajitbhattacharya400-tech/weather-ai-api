from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base

class WeatherLog(Base):
    __tablename__ = "weather_logs"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True)
    temperature = Column(Float)
    condition = Column(String)