# 🌦️ Weather AI API

An intelligent backend API that provides real-time weather data along with smart insights using FastAPI.

---

## 🚀 Features

* 🌐 Real-time weather data from OpenWeather API
* 🧠 AI-powered weather insights
* 🗄️ Database integration (SQLite + SQLAlchemy)
* 📜 Search history tracking
* ⚡ FastAPI with interactive Swagger UI

---

## 🧱 Tech Stack

* **Backend:** FastAPI
* **Language:** Python
* **Database:** SQLite
* **ORM:** SQLAlchemy
* **API:** OpenWeather

---

## 📂 Project Structure

```
app/
├── api/            # Routes
├── core/           # Config
├── db/             # Database setup
├── models/         # DB models
├── services/       # Business logic
│   ├── weather_service.py
│   └── insight_engine.py
├── main.py         # Entry point
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/biprajitbhattacharya400-tech/weather-ai-api.git
cd weather-ai-api
```

---

### 2️⃣ Create virtual environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
```

---

### 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Create `.env` file

```
WEATHER_API_KEY=your_api_key_here
```

---

### 5️⃣ Run the server

```bash
uvicorn app.main:app --reload
```

---

## 🌐 API Endpoints

### 🔹 Get Weather + Insights

```
GET /weather/{city}
```

**Example Response:**

```json
{
  "city": "Dharmanagar",
  "insights": [
    "⛈️ Heavy rain expected. Avoid going out."
  ],
  "data": [...]
}
```

---

### 🔹 Get Search History

```
GET /history
```

**Example Response:**

```json
[
  {
    "id": 1,
    "city": "Kolkata",
    "temperature": 30.5,
    "condition": "Clouds"
  }
]
```

---

## 🧠 How It Works

1. User sends request
2. API fetches real-time data from OpenWeather
3. Insight engine analyzes weather data
4. Data is stored in database
5. Response returned with insights

---

## 🔐 Environment Variables

| Variable        | Description         |
| --------------- | ------------------- |
| WEATHER_API_KEY | OpenWeather API key |

---

## 📌 Future Improvements

* 🔥 Redis caching
* 🤖 LLM-based insights
* 📊 Advanced analytics
* 🌍 Multi-city comparison

---

## 👨‍💻 Author

**Biprajit Bhattacharya**
Backend Developer | AI Enthusiast

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
