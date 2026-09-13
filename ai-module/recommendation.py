"""
AI Bus Recommendation Engine
Uses Google Gemini to intelligently rank and explain bus options.
Now fetches REAL bus data from MongoDB Atlas instead of mock data.
"""

import os
import json
import asyncio
import re
from typing import List, Dict, Any
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

from bus_data import (
    fetch_buses_from_db,
    filter_buses,
    heuristic_score as _shared_heuristic_score,
)

load_dotenv()

# ── Configuration ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

genai.configure(api_key=GEMINI_API_KEY)

# NOTE: real-data retrieval now lives in bus_data.py (fetch_buses_from_db),
# shared with chatbot.py, so both stay consistent. Kept the same function
# name here via the import above so the rest of this file (and its
# behavior/signature) is unchanged.

# ── Recommendation Engine ──────────────────────────────────────────────────────
class BusRecommendationEngine:
    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature":     0.3,
                "top_p":           0.9,
                "max_output_tokens": 2048,
            },
        )

    def _heuristic_score(self, bus: Dict, preferences: List[str]) -> float:
        """Fast rule-based pre-score (0–100) before Gemini re-ranking.
        Delegates to the shared implementation in bus_data.py."""
        return _shared_heuristic_score(bus, preferences)

    async def _ai_rank_and_explain(
        self, buses: List[Dict], source: str, destination: str,
        date: str, passengers: int, preferences: List[str],
    ) -> Dict:
        """Ask Gemini to rank buses and generate summary + per-bus reasons."""
        buses_json = json.dumps(buses[:6], indent=2)
        pref_str = ", ".join(preferences) if preferences else "No specific preferences"
        prompt = f"""You are an expert bus booking advisor. Analyze these bus options and provide intelligent recommendations.

ROUTE: {source} → {destination}
DATE: {date}
PASSENGERS: {passengers}
USER PREFERENCES: {pref_str}

BUS OPTIONS:
{buses_json}

Your task:
1. Rank these buses from best to worst for this user
2. For each bus, write a 1-sentence recommendation reason (max 20 words)
3. Write an overall AI summary (2–3 sentences) about the best options

Respond ONLY with valid JSON in this exact format:
{{
  "ranked_bus_ids": ["BUS1001", "BUS1003", ...],
  "reasons": {{
    "BUS1001": "Best value with top rating and WiFi — ideal for overnight travel.",
    "BUS1003": "Premium Volvo with sleeper seats, perfect for comfort seekers."
  }},
  "ai_summary": "For this route, we recommend the RedBus Express AC Sleeper for the best comfort-to-price ratio."
}}"""
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: self.model.generate_content(prompt))
        raw = response.text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)

    async def get_recommendations(
        self, source: str, destination: str, date: str,
        passengers: int = 1, preferences: List[str] = None,
    ) -> Dict:
        """Return AI-ranked bus recommendations using REAL data from MongoDB."""
        preferences = preferences or []

        # 1. Try to fetch real buses from MongoDB via backend API
        buses = fetch_buses_from_db(source, destination)

        if not buses:
            return {
                "source": source,
                "destination": destination,
                "date": date,
                "recommendations": [],
                "ai_summary": f"No buses found from {source} to {destination} for {date}.",
            }

        bus_type = next(
            (
                value
                for value in ("Non-AC", "Sleeper", "Seater", "AC")
                if any(value.lower() in preference.lower() for preference in preferences)
            ),
            None,
        )
        max_price = next(
            (
                float(match.group(1))
                for preference in preferences
                for match in [re.search(
                    r"(?:under|below|less than|max(?:imum)?)[^0-9]*(\d+(?:\.\d+)?)",
                    preference.lower(),
                )]
                if match
            ),
            None,
        )
        amenity_names = [
            name
            for name in ("WiFi", "Charging Point", "Blanket", "Water Bottle", "Snacks", "Reading Light")
            if any(name.lower() in preference.lower() for preference in preferences)
        ]
        buses = filter_buses(
            buses,
            bus_type=bus_type,
            max_price=max_price,
            amenities=amenity_names,
        )
        buses = [
            bus
            for bus in buses
            if bus.get("seats_available", 0) >= passengers
            and (not date or not bus.get("date") or bus.get("date") == date)
        ]

        if not buses:
            return {
                "source": source,
                "destination": destination,
                "date": date,
                "recommendations": [],
                "ai_summary": f"No buses found from {source} to {destination} matching your preferences.",
            }

        # 3. Heuristic pre-scoring
        for bus in buses:
            bus["ai_score"] = self._heuristic_score(bus, preferences)

        buses.sort(key=lambda b: b["ai_score"], reverse=True)

        # 4. AI re-ranking & explanations
        try:
            ai_result = await self._ai_rank_and_explain(
                buses, source, destination, date, passengers, preferences
            )
            ranked_ids = ai_result.get("ranked_bus_ids", [])
            reasons    = ai_result.get("reasons", {})
            ai_summary = ai_result.get("ai_summary", "Here are the best buses for your route.")
            bus_map = {b["bus_id"]: b for b in buses}
            ranked_buses = []
            for bus_id in ranked_ids:
                if bus_id in bus_map:
                    bus = bus_map[bus_id]
                    bus["recommendation_reason"] = reasons.get(bus_id, "Highly rated option for this route.")
                    ranked_buses.append(bus)
            ranked_bus_ids_set = set(ranked_ids)
            for bus in buses:
                if bus["bus_id"] not in ranked_bus_ids_set:
                    bus["recommendation_reason"] = "Good alternative option."
                    ranked_buses.append(bus)
        except (json.JSONDecodeError, Exception):
            ai_summary = (
                "BusBuddy AI is currently unavailable. "
                "Showing matching real buses ranked by basic criteria."
            )
            for bus in buses:
                bus["recommendation_reason"] = f"Rated {bus['rating']}★ with {bus['seats_available']} seats available."
            ranked_buses = buses

        return {
            "source":          source,
            "destination":     destination,
            "date":            date,
            "recommendations": ranked_buses[:6],
            "ai_summary":      ai_summary,
        }

    async def get_price_prediction(self, source: str, destination: str, travel_date: str) -> Dict:
        """Predict whether prices will rise or fall using Gemini analysis."""
        prompt = f"""As a travel pricing expert, analyze bus ticket pricing trends for:
Route: {source} → {destination}
Travel Date: {travel_date}
Today: {datetime.now().strftime('%Y-%m-%d')}

Respond ONLY with JSON:
{{
  "trend": "rising|falling|stable",
  "confidence": 0.85,
  "recommendation": "Book now — prices typically rise 20% closer to the date.",
  "best_booking_window": "3–7 days before travel"
}}"""
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: self.model.generate_content(prompt))
        raw = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)