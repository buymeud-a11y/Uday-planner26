from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import re
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

TOUR_SYSTEM_PROMPT = """You are an expert Indian tour planner with comprehensive knowledge of hotels, transportation, restaurants, and tourist attractions across India and popular international destinations visited by Indian tourists.

When asked to create a tour plan, respond with ONLY a valid JSON object. Do NOT include any markdown formatting, code blocks, backticks, explanations, or any text before or after the JSON. The response must start with { and end with }.

Use realistic pricing in Indian Rupees (INR) based on current 2024-2025 market rates:
- Premium 3-4 star hotels: Rs.3000-10000 per night (varies by location)
- Budget hotels (1-2 star or OYO/budget chains): Rs.700-2500 per night
- Sedan car rental (with driver): Rs.2500-4000 per day
- Hatchback car rental (with driver): Rs.1200-2000 per day

Return a JSON object with this exact structure (fill in all real values):
{
  "destination": "city/place name",
  "state_country": "state or country name",
  "duration_days": <number>,
  "is_multi_city": <true if the trip visits 2+ cities/towns, false if single base city>,
  "overview": "engaging 2-3 sentence description of destination",
  "best_time_to_visit": "recommended months e.g. October to March",
  "highlights": ["top attraction 1", "top attraction 2", "top attraction 3", "top attraction 4"],
  "itinerary": [
    {
      "day": 1,
      "title": "Catchy Day Title",
      "morning": "Detailed morning activity description with specific places",
      "afternoon": "Detailed afternoon activity with specific places to visit",
      "evening": "Evening activity and dinner recommendation",
      "places_visited": ["Place 1", "Place 2", "Place 3"],
      "food_recommendation": "Specific local dish or restaurant name to try",
      "estimated_food_cost_inr": <number like 800>
    }
  ],
  "premium_plan": {
    "hotels": [
      {
        "city": "City name where this hotel is located",
        "name": "Real 3-4 star hotel name that exists in this city",
        "stars": 4,
        "google_rating": 4.4,
        "location": "specific neighbourhood/area",
        "price_per_night_inr": <number>,
        "nights_stay": <number of nights staying in this hotel>,
        "total_cost_inr": <price_per_night * nights_stay>,
        "amenities": ["Swimming Pool", "Restaurant", "Spa", "WiFi", "Room Service"],
        "why_recommended": "Short reason why this hotel is a great premium choice"
      }
    ],
    "transport": {
      "vehicle_type": "Sedan",
      "recommended_models": "Honda City / Toyota Corolla / Maruti Ciaz",
      "price_per_day_inr": <number between 2500-4000>,
      "total_transport_cost_inr": <price_per_day * duration_days>,
      "includes_driver": true,
      "rental_suggestions": "Book via Zoomcar, Myles, or local cab service aggregators"
    },
    "total_stay_cost_inr": <sum of all hotels total_cost_inr>,
    "total_transport_cost_inr": <same as transport total>,
    "grand_total_inr": <stay + transport>,
    "cost_notes": "Prices approximate and may vary by season"
  },
  "budget_plan": {
    "hotels": [
      {
        "city": "City name where this hotel is located",
        "name": "Real budget hotel or OYO property name in this city",
        "stars": 2,
        "google_rating": 4.1,
        "location": "specific neighbourhood/area",
        "price_per_night_inr": <number between 700-2500>,
        "nights_stay": <number of nights staying in this hotel>,
        "total_cost_inr": <price_per_night * nights_stay>,
        "amenities": ["AC", "WiFi", "Hot Water", "24hr Checkout"],
        "why_recommended": "Good value, clean rooms, well-rated on OYO or MakeMyTrip"
      }
    ],
    "transport": {
      "vehicle_type": "Hatchback",
      "recommended_models": "Maruti Swift / Hyundai i20 / Tata Tiago",
      "price_per_day_inr": <number between 1200-2000>,
      "total_transport_cost_inr": <price_per_day * duration_days>,
      "includes_driver": true,
      "rental_suggestions": "Book via Ola outstation, local taxi operators, or Zoomcar"
    },
    "total_stay_cost_inr": <sum of all hotels total_cost_inr>,
    "total_transport_cost_inr": <same as transport total>,
    "grand_total_inr": <stay + transport>,
    "cost_notes": "Budget-friendly option with good value for money"
  },
  "travel_tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3", "Practical tip 4"],
  "international_essentials": {
    "visa_requirements_for_indians": "e.g., E-visa required / Visa on arrival / Schengen required",
    "local_currency": "e.g., Euro (EUR)",
    "exchange_rate_estimate_inr": "e.g., 1 EUR ≈ 90 INR",
    "emergency_numbers": "e.g., Police: 112, Ambulance: 15",
    "cultural_etiquette": "Short cultural tip for Indian travelers"
  },
  "estimated_total_food_cost_inr": <total food cost for all days>,
  "currency": "INR"
}

IMPORTANT RULES:
- Use REAL hotel names that actually exist at each destination city
- MULTI-CITY TOURS: If the trip spans multiple cities (e.g., Rajasthan circuit: Jaipur, Jodhpur, Jaisalmer, Udaipur), the "hotels" array MUST contain one entry per city the traveler actually stays overnight in. Distribute nights_stay logically based on the itinerary (match where the traveler sleeps each night).
- SINGLE-CITY TOURS: The "hotels" array should contain exactly one entry for the base city.
- Sum of all nights_stay across the hotels array MUST equal (duration_days - 1) because the last day is checkout (no overnight stay).
- Each hotel's total_cost_inr = price_per_night_inr x nights_stay
- plan.total_stay_cost_inr = sum of every hotel's total_cost_inr in that plan
- transport total = price_per_day x duration_days
- grand_total = total_stay + total_transport
- itinerary array must have exactly duration_days entries (one per day)
- All numbers must be actual integers/floats, NOT strings
- Google ratings must be between 3.5 and 5.0
- For a multi-city plan, premium_plan.hotels and budget_plan.hotels MUST have the SAME list of cities in the SAME order with IDENTICAL nights_stay per city (only the hotel name/price/rating changes).
"""


def extract_json_robust(text: str) -> dict:
    """Robustly extract valid JSON from AI response, handling markdown and partial outputs."""
    text = text.strip()

    # Strip markdown code fences
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    # Direct parse attempt
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find start of JSON object
    start = text.find("{")
    if start == -1:
        raise json.JSONDecodeError("No JSON object found", text, 0)

    # Use JSONDecoder.raw_decode to get first complete JSON object
    try:
        obj, _ = json.JSONDecoder().raw_decode(text, start)
        return obj
    except json.JSONDecodeError:
        pass

    # Fallback: find matching braces manually to recover truncated JSON
    depth, in_string, escape = 0, False, False
    for i, c in enumerate(text[start:], start):
        if escape:
            escape = False
            continue
        if c == "\\" and in_string:
            escape = True
            continue
        if c == '"' and not escape:
            in_string = not in_string
        if not in_string:
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return json.loads(text[start:i + 1])

    raise json.JSONDecodeError("Could not extract valid JSON from response", text, start)


class TourRequest(BaseModel):
    place: str = Field(min_length=2, max_length=100)
    days: int = Field(ge=1, le=30)
    budget: Optional[float] = None

class TranslationRequest(BaseModel):
    text: str


@api_router.get("/")
async def root():
    return {"message": "Plan & Tour API is running", "status": "ok"}


@api_router.post("/tour/generate")
async def generate_tour_plan(request: TourRequest):
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="AI service not configured. Please add GROQ_API_KEY to environment variables.")

    groq_client = Groq(api_key=groq_api_key)
    model = "openai/gpt-oss-120b"  # migrated from llama-3.3-70b-versatile

    base_user_text = f"Create a detailed {request.days}-day tour plan for {request.place}."
    if request.budget:
        base_user_text += f" Total budget is approximately Rs.{request.budget}."

    last_error = None
    for attempt in range(2):
        try:
            user_text = base_user_text
            if attempt == 1:
                user_text += " IMPORTANT: Respond with ONLY the JSON object, no other text."

            chat_completion = groq_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": TOUR_SYSTEM_PROMPT},
                    {"role": "user", "content": user_text}
                ],
                max_tokens=min(4000 + request.days * 500, 16000),
                temperature=0.7,
                reasoning_effort="low"  # keeps GPT-OSS from spending tokens on visible chain-of-thought
            )

            response_text = chat_completion.choices[0].message.content

            if chat_completion.choices[0].finish_reason == "length":
                logger.warning(f"Attempt {attempt + 1} response truncated (finish_reason=length)")
                raise json.JSONDecodeError("truncated response", response_text or "", 0)

            tour_data = extract_json_robust(response_text)
            break

        except json.JSONDecodeError as e:
            last_error = e
            logger.error(f"Attempt {attempt + 1} failed to parse JSON: {e}")
            if attempt == 1:
                raise HTTPException(status_code=500, detail="Failed to parse AI response after 2 attempts. Please try again.")

        except RateLimitError as e:
            last_error = e
            logger.error(f"Attempt {attempt + 1} rate limited: {e}")
            if attempt == 1:
                raise HTTPException(status_code=429, detail="AI service is busy right now, please try again in a minute.")

        except Exception as e:
            logger.error(f"Tour generation error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate tour plan: {str(e)}")

    logger.info(f"Tour plan generated successfully for: {request.place}")

    # Save to MongoDB
    plan_id = str(uuid.uuid4())
    doc = {
        "plan_id": plan_id,
        "destination": request.place,
        "days": request.days,
        "budget": request.budget,
        "tour_data": tour_data,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.tour_plans.insert_one(doc)

    tour_data["plan_id"] = plan_id
    return tour_data


@api_router.get("/tour/share/{plan_id}")
async def get_shared_plan(plan_id: str):
    doc = await db.tour_plans.find_one({"plan_id": plan_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Tour plan not found or link has expired.")
    tour_data = doc.get("tour_data", {})
    tour_data["plan_id"] = plan_id
    return tour_data


@api_router.get("/tour/history")
async def get_tour_history():
    docs = await db.tour_plans.find(
        {},
        {
            "_id": 0,
            "plan_id": 1,
            "destination": 1,
            "days": 1,
            "budget": 1,
            "created_at": 1,
            "tour_data.state_country": 1,
            "tour_data.highlights": 1,
            "tour_data.overview": 1,
            "tour_data.premium_plan.grand_total_inr": 1,
            "tour_data.budget_plan.grand_total_inr": 1,
        }
    ).sort("created_at", -1).to_list(20)
    result = []
    for doc in docs:
        td = doc.get("tour_data") or {}
        result.append({
            "plan_id": doc.get("plan_id"),
            "destination": doc.get("destination") or td.get("destination", "Unknown"),
            "state_country": td.get("state_country", ""),
            "days": doc.get("days"),
            "budget": doc.get("budget"),
            "created_at": doc.get("created_at"),
            "premium_total": (td.get("premium_plan") or {}).get("grand_total_inr"),
            "budget_total": (td.get("budget_plan") or {}).get("grand_total_inr"),
            "highlights": (td.get("highlights") or [])[:3],
            "overview": td.get("overview", "")[:130],
        })
    return result


@api_router.post("/tour/translate")
async def translate_text(request: TranslationRequest):
    """Extremely fast, free-tier translation using Groq."""
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="AI service not configured.")
    
    groq_client = Groq(api_key=groq_api_key)
    # Using a fast, lightweight model to save tokens and reduce latency
    model = "llama3-8b-8192" 
    
    try:
        chat_completion = groq_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a fast, accurate translator. Translate the user's foreign text into English. Respond ONLY with the translation, nothing else."},
                {"role": "user", "content": request.text}
            ],
            max_tokens=200,
            temperature=0.3,
        )
        return {"translation": chat_completion.choices[0].message.content.strip()}
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail="Translation failed.")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    mongo_client.close()
