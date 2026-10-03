from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from groq import Groq, RateLimitError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[os.environ['DB_NAME']]

app = FastAPI(title="Plan & Tour API")
api_router = APIRouter(prefix="/api")

TOUR_SYSTEM_PROMPT = """You are an expert Indian tour planner with comprehensive knowledge of international travel.

When asked to create a tour plan, respond with ONLY a valid JSON object. Do NOT include any markdown formatting, code blocks, or explanations. 

Return a JSON object with this exact structure (fill in all real values):
{
  "destination": "city/place name",
  "state_country": "state or country name",
  "duration_days": <number>,
  "is_multi_city": <boolean>,
  "overview": "engaging 2-3 sentence description",
  "best_time_to_visit": "recommended months",
  "highlights": ["attraction 1", "attraction 2", "attraction 3"],
  "itinerary": [
    {
      "day": 1,
      "title": "Day Title",
      "morning": "Morning activity",
      "afternoon": "Afternoon activity",
      "evening": "Evening activity",
      "places_visited": ["Place 1"],
      "food_recommendation": "Local dish",
      "estimated_food_cost_inr": <number>
    }
  ],
  "premium_plan": {
    "hotels": [{"city": "City", "name": "4-star hotel", "stars": 4, "google_rating": 4.4, "location": "area", "price_per_night_inr": 5000, "nights_stay": 1, "total_cost_inr": 5000, "amenities": ["WiFi"], "why_recommended": "Reason"}],
    "transport": {"vehicle_type": "Sedan", "recommended_models": "City", "price_per_day_inr": 3000, "total_transport_cost_inr": 3000, "includes_driver": true, "rental_suggestions": "Zoomcar"},
    "total_stay_cost_inr": 5000,
    "total_transport_cost_inr": 3000,
    "grand_total_inr": 8000,
    "cost_notes": "Prices approximate"
  },
  "budget_plan": {
    "hotels": [{"city": "City", "name": "Budget hotel", "stars": 2, "google_rating": 4.0, "location": "area", "price_per_night_inr": 1500, "nights_stay": 1, "total_cost_inr": 1500, "amenities": ["WiFi"], "why_recommended": "Reason"}],
    "transport": {"vehicle_type": "Hatchback", "recommended_models": "Swift", "price_per_day_inr": 1500, "total_transport_cost_inr": 1500, "includes_driver": true, "rental_suggestions": "Ola"},
    "total_stay_cost_inr": 1500,
    "total_transport_cost_inr": 1500,
    "grand_total_inr": 3000,
    "cost_notes": "Budget-friendly"
  },
  "travel_tips": ["Tip 1", "Tip 2"],
  "international_essentials": {
    "visa_requirements": "Detailed visa requirements for Indians (e.g., E-visa / Schengen)",
    "entry_checklist": ["Passport validity > 6 months", "Return ticket", "Hotel proof"],
    "country_facts": "Capital, primary language, and time zone difference from IST",
    "local_currency": "Currency name and code (e.g., USD)",
    "exchange_rate_estimate_inr": "e.g., 1 USD ≈ 83 INR",
    "sim_and_connectivity": "Best local SIM providers or eSIM (e.g., Airalo)",
    "local_transport_guide": "Details on public transit, taxis, and airport transfers",
    "packing_checklist": ["Universal adapter", "Comfortable walking shoes"],
    "emergency_numbers": "Police, Fire, Ambulance",
    "embassy_info": "Indian Embassy/Consulate contact details or location"
  },
  "estimated_total_food_cost_inr": <number>,
  "currency": "INR"
}
"""

def extract_json_robust(text: str) -> dict:
    text = text.strip()
    if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text: text = text.split("```")[1].split("```")[0].strip()
    try: return json.loads(text)
    except: pass
    start = text.find("{")
    if start == -1: raise json.JSONDecodeError("No JSON", text, 0)
    try:
        obj, _ = json.JSONDecoder().raw_decode(text, start)
        return obj
    except: pass
    depth, in_string, escape = 0, False, False
    for i, c in enumerate(text[start:], start):
        if escape: escape = False; continue
        if c == "\\" and in_string: escape = True; continue
        if c == '"' and not escape: in_string = not in_string
        if not in_string:
            if c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0: return json.loads(text[start:i + 1])
    raise json.JSONDecodeError("Could not extract", text, start)

class TourRequest(BaseModel):
    place: str = Field(min_length=2, max_length=100)
    days: int = Field(ge=1, le=30)
    budget: Optional[float] = None

class TranslationRequest(BaseModel):
    text: str

@api_router.get("/")
async def root(): return {"status": "ok"}

@api_router.post("/tour/generate")
async def generate_tour_plan(request: TourRequest):
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key: raise HTTPException(status_code=500, detail="Missing API Key")
    groq_client = Groq(api_key=groq_api_key)
    
    base_user_text = f"Create a detailed {request.days}-day tour plan for {request.place}."
    if request.budget: base_user_text += f" Total budget is approximately Rs.{request.budget}."

    for attempt in range(2):
        try:
            user_text = base_user_text
            if attempt == 1: user_text += " Respond ONLY with the JSON object."
            chat_completion = groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "system", "content": TOUR_SYSTEM_PROMPT}, {"role": "user", "content": user_text}],
                max_tokens=min(4000 + request.days * 500, 16000), temperature=0.7, reasoning_effort="low"
            )
            tour_data = extract_json_robust(chat_completion.choices[0].message.content)
            break
        except Exception as e:
            if attempt == 1: raise HTTPException(status_code=500, detail=str(e))

    plan_id = str(uuid.uuid4())
    doc = {"plan_id": plan_id, "destination": request.place, "days": request.days, "budget": request.budget, "tour_data": tour_data, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.tour_plans.insert_one(doc)
    tour_data["plan_id"] = plan_id
    return tour_data

@api_router.get("/tour/share/{plan_id}")
async def get_shared_plan(plan_id: str):
    doc = await db.tour_plans.find_one({"plan_id": plan_id}, {"_id": 0})
    if not doc: raise HTTPException(status_code=404)
    tour_data = doc.get("tour_data", {})
    tour_data["plan_id"] = plan_id
    return tour_data

@api_router.get("/tour/history")
async def get_tour_history():
    docs = await db.tour_plans.find({}, {"_id": 0, "plan_id": 1, "destination": 1, "days": 1, "budget": 1, "created_at": 1, "tour_data.state_country": 1, "tour_data.premium_plan.grand_total_inr": 1, "tour_data.budget_plan.grand_total_inr": 1}).sort("created_at", -1).to_list(20)
    return docs

@api_router.post("/tour/translate")
async def translate_text(request: TranslationRequest):
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key: raise HTTPException(status_code=500, detail="Missing API Key")
    groq_client = Groq(api_key=groq_api_key)
    try:
        chat_completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "system", "content": "You are a fast, accurate translator. Translate the user's foreign text into English. Respond ONLY with the translation, nothing else."}, {"role": "user", "content": request.text}],
            max_tokens=200, temperature=0.3
        )
        return {"translation": chat_completion.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Translation failed.")

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

@app.on_event("shutdown")
async def shutdown_db_client(): mongo_client.close()
