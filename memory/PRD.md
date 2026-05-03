# Plan & Tour - Product Requirements Document

## Overview
AI-powered web application that generates complete tour plans with Premium and Budget options, including hotel recommendations and car rental costs in INR.

## Architecture
- **Frontend**: React (CRA + Craco), Tailwind CSS, lucide-react icons
- **Backend**: FastAPI (Python), MongoDB (Motor), emergentintegrations
- **AI Model**: OpenAI GPT-4.1-nano via Emergent Universal Key
- **Fonts**: Outfit (headings) + Manrope (body) from Google Fonts
- **Theme**: Organic & Earthy — Deep Forest Green (#1C3325) + Terracotta (#D96B42)

## Core Requirements (Static)
1. Input: Place of tour, Days of tour, Budget in INR (optional)
2. AI generates: Day-by-day itinerary, Premium Plan, Budget Plan
3. Premium Plan: 3-4 star hotel + Sedan car with INR costs
4. Budget Plan: Budget hotel + Hatchback car with INR costs
5. All costs in Indian Rupees (INR)
6. Mobile responsive, modern design

## What's Been Implemented (May 2026)
- **Hero Section**: Full-height with Kerala backwaters background, bento-grid form
- **Input Form**: Destination, Days, Budget (optional) with 3 action buttons
- **AI Tour Generation**: POST /api/tour/generate → GPT-4.1-nano response
- **Tour Plan Tab**: Day-by-day itinerary with morning/afternoon/evening + places + food
- **Premium Tour Tab**: Dark-themed card with 3-4 star hotel image, Sedan car, INR costs, grand total
- **Budget Tour Tab**: Light-themed card with budget hotel, Hatchback car, INR costs
- **Loading Animation**: Marquee of destination names + floating plane animation
- **Tab Navigation**: Sticky tabs (Tour Plan / Premium / Budget) for switching views
- **Reset Flow**: "Plan Another Trip" clears form and scrolls back to top
- **MongoDB**: Tour plan history stored in `tour_plans` collection
- **Error Handling**: User-friendly error messages for validation and API failures
- **Input Validation**: Checks for empty destination and days

## API Endpoints
- `GET /api/` — Health check
- `POST /api/tour/generate` — AI tour generation (place, days, budget?)
- `GET /api/tour/history` — Recent plans (last 20)

## Key Files
- `/app/backend/server.py` — FastAPI + Claude AI endpoint
- `/app/backend/.env` — EMERGENT_LLM_KEY, MONGO_URL, DB_NAME
- `/app/frontend/src/components/tour/HomePage.jsx` — Main state + layout
- `/app/frontend/src/components/tour/HeroSection.jsx` — Hero + form
- `/app/frontend/src/components/tour/TourPlanSection.jsx` — Itinerary
- `/app/frontend/src/components/tour/PlanCard.jsx` — Premium/Budget cards
- `/app/frontend/src/components/tour/LoadingState.jsx` — Loading animation

## Prioritized Backlog (P0/P1/P2)

### P0 (Critical — for next session)
- None — all core features working

- **PDF/Print Download**: "Download PDF" button (dark green) at bottom of results; `window.print()` triggers browser print dialog; hidden `PrintableView` component renders full A4 layout (header, itinerary, premium plan, budget plan, travel tips) with `@media print` CSS — user saves as PDF from print dialog
- PDF download of tour plan
- Destination-specific hotel/car images (instead of generic stock photos)
- Add "Places to Eat" and "Nightlife" sections to itinerary

### P2 (Nice to Have)
- Tour history page to revisit past plans
- Currency converter (for international destinations)
- Map integration (Google Maps embed for destinations)
- User accounts to save favorite plans

## Test Results (May 2026)
- Backend: 100% (7/7 tests pass)
- Frontend: 95% — All core flows working
- AI Response time: ~7 seconds for 3-day plan
