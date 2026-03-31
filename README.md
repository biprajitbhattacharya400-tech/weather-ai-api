# 🌦️ Weather AI API & Dashboard

An intelligent full-stack weather application. The backend is built with **FastAPI**, enhanced with **LLM-powered insights**, **Redis caching**, and **analytics**. The frontend is a **modern, premium React dashboard** featuring dynamic glassmorphism UI and sleek real-time weather tracking.

---

Live Server Frontend : https://weather-ai-api.vercel.app/

Backend swagger Ui : https://weather-ai-api-lxdy.onrender.com/docs

## 🚀 Key Features

* 🖥️ **Premium Frontend Dashboard** (React + Vite with dynamic backgrounds & glassmorphism)
* 🌤️ **Real-time Weather & Hourly Forecasts** (via external API mapped to custom endpoints)
* 🤖 **AI-powered Insights** using LLM (Groq) to provide smart daily recommendations
* 🌍 **Multi-city Comparison** in both API and visually in the UI grid
* ⚡ **Redis Caching** for lightning-fast backend responses
* 💾 **Database Logging** (SQLAlchemy) & 📊 **Analytics API** (trends, usage, averages)
* 🌐 **CORS Enabled** natively for seamless frontend integration

---

## 🧠 Architecture Flow

```text
React Frontend (User Search / Dashboard)
     ↓
FastAPI Backend
     ↓
Weather API → Fetch data & 24h forecast
     ↓
LLM → Generate tailored insight (Groq)
     ↓
Redis → Cache response
     ↓
Database → Store logs & analytics
     ↓
Return formatted JSON response
```

---

## 📌 API Endpoints

### 🌤️ Get Weather (Single City)

```
GET /weather/{city}
```

### 🌍 Compare Multiple Cities

```
GET /weather/compare?cities=kolkata,delhi,mumbai
```

### 📜 Get History

```
GET /history
```

### 📊 Analytics

```
GET /analytics
```

---

## ⚡ Tech Stack

* **Frontend:** React, Vite, Vanilla CSS (Modern UI/UX), Lucide Icons
* **Backend:** FastAPI, Python
* **Database & Caching:** SQLite + SQLAlchemy, Redis
* **AI/LLM:** Groq (LLaMA 3.1)

---

## 🛠️ Setup Instructions

### Backend Setup (FastAPI)

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/weather-ai-api.git
cd weather-ai-api
```

#### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
# or
source venv/bin/activate # Mac/Linux
```

#### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4️⃣ Setup Environment Variables

Create `.env` file in the root directory:

```env
WEATHER_API_KEY=your_weather_api_key
GROQ_API_KEY=your_groq_api_key
```

#### 5️⃣ Run Server

```bash
uvicorn app.main:app --reload
```

#### 6️⃣ Open Swagger UI (Optional)
```
http://127.0.0.1:8000/docs
```

---

### Frontend Setup (React/Vite)

#### 1️⃣ Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 2️⃣ Setup Frontend Environment Variables
Create `.env` file inside the `frontend/` directory:
```env
VITE_API_URL=http://127.0.0.1:8000
# Alternatively, point it to your deployed Render URL:
# VITE_API_URL=https://weather-ai-api-lxdy.onrender.com
```

#### 3️⃣ Run Frontend Development Server
```bash
npm run dev
```
Visit `http://localhost:5173/` in your browser to view the premium UI.

---

## 📊 Example Backend Response

```json
{
  "city": "kolkata",
  "temperature": 30.2,
  "condition": "Clouds",
  "insight": "Carry an umbrella due to cloudy weather.",
  "forecast": [
    {
      "time": "2023-11-20 15:00:00",
      "temperature": 31.0,
      "condition": "Clouds"
    }
  ]
}
```

---

## ☁️ Deployment

* **Backend:** Easily deployable on **Render** or **Railway**. *(Ensure you push the updated `main.py` which contains the latest CORS middleware).*
* **Frontend:** Production-ready for **Vercel** or **Netlify**. Ensure the Root Directory is set to `frontend/` and add the `VITE_API_URL` environment variable to match your live backend URL.

---

## 🔥 Future Improvements

* 📈 Time-based weather trends visually mapped in Dashboard
* 🔐 User Authentication layer
* 🌤️ Interactive map integrations

---

## 👨‍💻 Author

**Biprajit Bhattacharya**

* 💼  Developer | AI/ML Enthusiast
* 🚀 Building intelligent systems with FastAPI, Python, and React

---

## ⭐ If you like this project

Made with ❤ by Biprajit Bhattacharya

Give it a star ⭐ on GitHub!
