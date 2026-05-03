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
from emergentintegrations.llm.chat import LlmChat, UserMessage

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
    "hotel": {
      "name": "Real 3-4 star hotel name that exists at destination",
      "stars": 4,
      "google_rating": 4.4,
      "location": "specific neighbourhood/area",
      "price_per_night_inr": <number>,
      "total_stay_cost_inr": <price_per_night * (duration-1)>,
      "amenities": ["Swimming Pool", "Restaurant", "Spa", "WiFi", "Room Service"],
      "why_recommended": "Short reason why this hotel is a great premium choice"
    },
    "transport": {
      "vehicle_type": "Sedan",
      "recommended_models": "Honda City / Toyota Corolla / Maruti Ciaz",
      "price_per_day_inr": <number between 2500-4000>,
      "total_transport_cost_inr": <price_per_day * duration_days>,
      "includes_driver": true,
      "rental_suggestions": "Book via Zoomcar, Myles, or local cab service aggregators"
    },
    "total_stay_cost_inr": <same as hotel total>,
    "total_transport_cost_inr": <same as transport total>,
    "grand_total_inr": <stay + transport>,
    "cost_notes": "Prices approximate and may vary by season"
  },
  "budget_plan": {
    "hotel": {
      "name": "Real budget hotel or OYO property name at destination",
      "stars": 2,
      "google_rating": 4.1,
      "location": "specific neighbourhood/area",
      "price_per_night_inr": <number between 700-2500>,
      "total_stay_cost_inr": <price_per_night * (duration-1)>,
      "amenities": ["AC", "WiFi", "Hot Water", "24hr Checkout"],
      "why_recommended": "Good value, clean rooms, well-rated on OYO or MakeMyTrip"
    },
    "transport": {
      "vehicle_type": "Hatchback",
      "recommended_models": "Maruti Swift / Hyundai i20 / Tata Tiago",
      "price_per_day_inr": <number between 1200-2000>,
      "total_transport_cost_inr": <price_per_day * duration_days>,
      "includes_driver": true,
      "rental_suggestions": "Book via Ola outstation, local taxi operators, or Zoomcar"
    },
    "total_stay_cost_inr": <same as hotel total>,
    "total_transport_cost_inr": <same as transport total>,
    "grand_total_inr": <stay + transport>,
    "cost_notes": "Budget-friendly option with good value for money"
  },
  "travel_tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3", "Practical tip 4"],
  "estimated_total_food_cost_inr": <total food cost for all days>,
  "currency": "INR"
}

IMPORTANT RULES:
- Use REAL hotel names that actually exist at the destination
- hotel total_stay_cost_inr = price_per_night_inr x (duration_days - 1) because last day is checkout
- transport total = price_per_day x duration_days
- grand_total = total_stay + total_transport
- itinerary array must have exactly duration_days entries (one per day)
- All numbers must be actual integers/floats, NOT strings
- Google ratings must be between 3.5 and 5.0
"""


class TourRequest(BaseModel):
    place: str = Field(min_length=2, max_length=100)
    days: int = Field(ge=1, le=30)
    budget: Optional[float] = None


@api_router.get("/")
async def root():
    return {"message": "Plan & Tour API is running", "status": "ok"}


@api_router.post("/tour/generate")
async def generate_tour_plan(request: TourRequest):
    try:
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            raise HTTPException(status_code=500, detail="AI service not configured. Please add EMERGENT_LLM_KEY to backend .env")

        chat = LlmChat(
            api_key=emergent_key,
            session_id=str(uuid.uuid4()),
            system_message=TOUR_SYSTEM_PROMPT
        ).with_model("openai", "gpt-4.1-nano")

        user_text = f"Create a detailed {request.days}-day tour plan for {request.place}."
        if request.budget:
            user_text += f" The traveler's total budget is approximately Rs.{request.budget:,.0f} INR."
        user_text += " Provide specific real hotel names, realistic current INR pricing, and a practical engaging day-by-day itinerary."

        logger.info(f"Generating tour plan for: {request.place}, {request.days} days")
        user_msg = UserMessage(text=user_text)
        response = await chat.send_message(user_msg)

        # Extract JSON from response (handle markdown code blocks)
        json_str = response.strip()
        if '```json' in json_str:
            json_str = json_str.split('```json')[1].split('```')[0].strip()
        elif '```' in json_str:
            json_str = json_str.split('```')[1].split('```')[0].strip()

        # Find the outermost JSON object
        start = json_str.find('{')
        end = json_str.rfind('}') + 1
        if start != -1 and end > start:
            json_str = json_str[start:end]

        tour_data = json.loads(json_str)
        logger.info(f"Tour plan generated successfully for: {request.place}")

        # Save to MongoDB
        doc = {
            "plan_id": str(uuid.uuid4()),
            "place": request.place,
            "days": request.days,
            "budget": request.budget,
            "destination": tour_data.get("destination", request.place),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tour_plans.insert_one(doc)

        return tour_data

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tour generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate tour plan: {str(e)}")


@api_router.get("/tour/history")
async def get_tour_history():
    plans = await db.tour_plans.find({}, {"_id": 0}).to_list(20)
    return plans


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
