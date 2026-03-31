# 🌦️ Weather AI API

An intelligent weather API built with **FastAPI**, enhanced with **LLM-powered insights**, **Redis caching**, and **analytics**.

---

## 🚀 Features

* 🌤️ **Real-time Weather Data** (via external API)
* 🤖 **AI-powered Insights** using LLM (Groq)
* 🌍 **Multi-city Comparison**
* ⚡ **Redis Caching** for faster responses
* 💾 **Database Logging** (SQLAlchemy)
* 📊 **Analytics API** (trends, usage, averages)

---

## 🧠 How It Works

```text
User Request
     ↓
FastAPI Backend
     ↓
Weather API → Fetch data
     ↓
LLM → Generate insight
     ↓
Redis → Cache response
     ↓
Database → Store logs
     ↓
Return JSON response
```

---

## 📌 API Endpoints

### 🌤️ Get Weather (Single City)

```
GET /weather/{city}
```

**Example:**

```
/weather/kolkata
```

---

### 🌍 Compare Multiple Cities

```
GET /weather/compare?cities=kolkata,delhi,mumbai
```

---

### 📜 Get History

```
GET /history
```

---

### 📊 Analytics

```
GET /analytics
```

**Returns:**

* Most searched city
* Request count per city
* Average temperature per city

---

## ⚡ Tech Stack

* **Backend:** FastAPI
* **Database:** SQLite + SQLAlchemy
* **Caching:** Redis
* **AI/LLM:** Groq (LLaMA 3.1)
* **Language:** Python

---

## 🛠️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/weather-ai-api.git
cd weather-ai-api
```

---

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
```

---

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Setup Environment Variables

Create `.env` file:

```env
WEATHER_API_KEY=your_weather_api_key
GROQ_API_KEY=your_groq_api_key
```

---

### 5️⃣ Run Server

```bash
uvicorn app.main:app --reload
```

---

### 6️⃣ Open Swagger UI

```
http://127.0.0.1:8000/docs
```

---

## ⚡ Redis (Optional but Recommended)

Run Redis locally:

```bash
docker run -d -p 6379:6379 redis
```

---

## 📊 Example Response

```json
{
  "city": "kolkata",
  "temperature": 30.2,
  "condition": "Clouds",
  "insight": "Carry an umbrella due to cloudy weather."
}
```

GET https://weather-ai-api-lxdy.onrender.com/weather/kolkata


## 📸 API Preview

![Swagger UI](assets/swagger.jpeg)

---

## 🔥 Future Improvements

* 📈 Time-based weather trends
* 🌐 Frontend dashboard (charts)
* 🔐 User authentication
* ☁️ Deployment (Render / Railway)

---

## 👨‍💻 Author

**Biprajit Bhattacharya**

* 💼 Backend Developer | AI/ML Enthusiast
* 🚀 Building intelligent systems with FastAPI & Python

---

## ⭐ If you like this project

Give it a star ⭐ on GitHub!
