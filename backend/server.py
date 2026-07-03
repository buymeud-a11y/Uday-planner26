from groq import Groq, RateLimitError


@api_router.post("/tour/generate")
async def generate_tour_plan(request: TourRequest):
    try:
        groq_api_key = os.environ.get('GROQ_API_KEY')
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="AI service not configured. Please add GROQ_API_KEY to environment variables.")

        groq_client = Groq(api_key=groq_api_key)
        model = "openai/gpt-oss-120b"  # migrated from llama-3.3-70b-versatile

        base_user_text = f"Create a detailed {request.days}-day tour plan for {request.place}."
        if request.budget:
            base_user_text += f" The traveler's total budget is approximately Rs.{request.budget:,.0f} INR."
        base_user_text += " Provide specific real hotel names, realistic current INR pricing, and a practical day-by-day itinerary."

        logger.info(f"Generating tour plan for: {request.place}, {request.days} days, model: {model}")

        tour_data = None
        last_error = None

        for attempt in range(2):
            try:
                # On retry, ask for shorter descriptions to avoid token limit
                if attempt == 0:
                    user_text = base_user_text
                else:
                    logger.warning(f"Retrying with compact format (attempt {attempt + 1})")
                    user_text = (
                        base_user_text +
                        " IMPORTANT: Keep all activity descriptions very concise (under 15 words each)."
                        " Return complete valid JSON only. No truncation."
                    )

                chat_completion = groq_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": TOUR_SYSTEM_PROMPT},
                        {"role": "user", "content": user_text}
                    ],
                    max_tokens=5000,       # trimmed down to fit the 8K TPM free-tier budget
                    temperature=0.7,
                    reasoning_effort="low"  # keeps GPT-OSS from spending tokens on visible chain-of-thought
                )

                response_text = chat_completion.choices[0].message.content
                tour_data = extract_json_robust(response_text)
                break  # success

            except (json.JSONDecodeError, ValueError) as e:
                last_error = e
                logger.error(f"Attempt {attempt + 1} JSON parse error: {e}")
                if attempt == 1:
                    raise HTTPException(status_code=500, detail="Failed to parse AI response after 2 attempts. Please try again.")

            except RateLimitError as e:
                last_error = e
                logger.error(f"Attempt {attempt + 1} rate limited: {e}")
                if attempt == 1:
                    raise HTTPException(status_code=429, detail="AI service is busy right now, please try again in a minute.")

        logger.info(f"Tour plan generated successfully for: {request.place}")

        # Save to MongoDB
        plan_id = str(uuid.uuid4())
        doc = {
            "plan_id": plan_id,
            "place": request.place,
            "days": request.days,
            "budget": request.budget,
            "destination": tour_data.get("destination", request.place),
            "tour_data": tour_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tour_plans.insert_one(doc)

        tour_data["plan_id"] = plan_id
        return tour_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tour generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate tour plan: {str(e)}")
