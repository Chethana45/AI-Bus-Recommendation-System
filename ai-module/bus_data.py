"""
Shared Bus Data Access Layer
─────────────────────────────
Fetches REAL bus data from MongoDB via the existing Node.js backend API
(GET /api/buses), and provides filtering + heuristic scoring helpers.

This module is intentionally the single source of truth for "how do we
get real buses" so that both the chatbot (chatbot.py) and the
recommendation engine (recommendation.py) stay consistent and never
have to invent bus data.
"""

import os
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

MONGO_API_URL = os.getenv("MONGO_API_URL", "http://localhost:3000/api")


# ── Retrieval ───────────────────────────────────────────────────────────────
def fetch_buses_from_db(source: Optional[str] = None, destination: Optional[str] = None) -> List[Dict]:
    """
    Fetch real bus data from MongoDB via the backend API (GET /api/buses).
    Returns [] on any failure or if no buses are found — callers must treat
    an empty list as "no real data available" and MUST NOT invent buses.
    """
    try:
        params = {}
        if source:
            params["from"] = source
        if destination:
            params["to"] = destination
        query_string = urllib.parse.urlencode(params)
        api_url = f"{MONGO_API_URL}/buses"
        if query_string:
            api_url = f"{api_url}?{query_string}"
        print(f"[bus_data] GET {api_url}")

        req = urllib.request.Request(api_url)
        with urllib.request.urlopen(req, timeout=6) as resp:
            print(f"[bus_data] HTTP status: {resp.status}")
            data = json.loads(resp.read().decode())
            buses = data if isinstance(data, list) else (data.get("data", []) if isinstance(data, dict) else [])
            print(f"[bus_data] Buses received: {len(buses)}")
            if buses:
                first_bus = buses[0]
                print(
                    "[bus_data] First bus route fields: "
                    f"from={first_bus.get('from')!r}, "
                    f"fromCity={first_bus.get('fromCity')!r}, "
                    f"to={first_bus.get('to')!r}, "
                    f"toCity={first_bus.get('toCity')!r}"
                )

            normalized = []
            for b in buses:
                bus_source = b.get("from") or b.get("fromCity") or ""
                bus_destination = b.get("to") or b.get("toCity") or ""
                normalized.append({
                    "bus_id":           str(b.get("_id", "")),
                    "operator":         b.get("operator", "Unknown"),
                    "bus_type":         b.get("busType", "AC"),
                    "busName":          b.get("busName", ""),
                    "departure":        b.get("departureTime", "00:00"),
                    "arrival":          b.get("arrivalTime", "00:00"),
                    "duration":         b.get("duration", "0h"),
                    "price":            float(b.get("fare", 0)),
                    "seats_available":  int(b.get("availableSeats", 0)),
                    "rating":           float(b.get("rating", 0) or 0),
                    "reviews":          b.get("reviews", 0),
                    "amenities":        b.get("amenities", []) or [],
                    "source":           bus_source,
                    "destination":      bus_destination,
                    "date":             b.get("date") or b.get("travelDate") or b.get("journeyDate"),
                    "boardingPoint":    b.get("boardingPoint", {}),
                    "droppingPoint":    b.get("droppingPoint", {}),
                    "image":            b.get("image", ""),
                })
            print(f"[bus_data] Buses remaining after route filtering: {len(normalized)}")
            return normalized
    except Exception as e:
        print(f"⚠️ bus_data.fetch_buses_from_db: could not reach backend API ({e})")
        return []


# ── Filtering ───────────────────────────────────────────────────────────────
def _normalize_type(value: str) -> str:
    return (value or "").lower().replace("-", "").replace(" ", "")


def bus_type_matches(bus_type: str, requested_type: str) -> bool:
    """Match bus type robustly (avoids 'AC' incorrectly matching 'Non-AC')."""
    bt = _normalize_type(bus_type)
    req = _normalize_type(requested_type)
    if not req:
        return True
    if req == "ac":
        return "ac" in bt and "nonac" not in bt
    if req == "nonac":
        return "nonac" in bt
    return req in bt


def filter_buses(
    buses: List[Dict],
    bus_type: Optional[str] = None,
    max_price: Optional[float] = None,
    amenities: Optional[List[str]] = None,
) -> List[Dict]:
    """Filter a list of normalized buses by type, price ceiling, and required amenities."""
    result = buses

    if bus_type:
        result = [b for b in result if bus_type_matches(b.get("bus_type", ""), bus_type)]

    if max_price is not None:
        try:
            ceiling = float(max_price)
            result = [b for b in result if b.get("price", 0) <= ceiling]
        except (TypeError, ValueError):
            pass

    if amenities:
        wanted = [a.lower().strip() for a in amenities if a]

        def has_all_amenities(bus: Dict) -> bool:
            have = [str(a).lower().strip() for a in bus.get("amenities", [])]
            return all(any(w in h or h in w for h in have) for w in wanted)

        result = [b for b in result if has_all_amenities(b)]

    return result


# ── Scoring ─────────────────────────────────────────────────────────────────
def heuristic_score(bus: Dict, preferences: Optional[List[str]] = None) -> float:
    """Fast rule-based score (0-100) used to rank real buses when no LLM re-ranking is done."""
    preferences = preferences or []
    score = 50.0
    score += (bus.get("rating", 0) - 3.0) * 12.5

    seats = bus.get("seats_available", 0)
    if seats > 20:
        score += 10
    elif seats > 10:
        score += 5

    price = bus.get("price", 0)
    if price and price < 500:
        score += 8
    elif price and price > 1200:
        score -= 8

    bus_amenities_lower = [str(a).lower() for a in bus.get("amenities", [])]
    pref_map = {
        "wifi":     ("wifi", 8),
        "ac":       ("ac", 6),
        "charging": ("charging point", 6),
        "sleeper":  ("blanket", 5),
        "food":     ("snacks", 5),
        "tracking": ("live tracking", 4),
    }
    for pref in preferences:
        pref_l = pref.lower()
        for key, (amenity, pts) in pref_map.items():
            if key in pref_l and any(amenity in a for a in bus_amenities_lower):
                score += pts
        if "sleeper" in pref_l and "sleeper" in bus.get("bus_type", "").lower():
            score += 10
        if "volvo" in pref_l and "volvo" in bus.get("bus_type", "").lower():
            score += 8
        if "ac" in pref_l and "ac" in bus.get("bus_type", "").lower():
            score += 6

    return min(max(score, 0), 100)


def sort_buses(buses: List[Dict], sort_by: Optional[str] = None, preferences: Optional[List[str]] = None) -> List[Dict]:
    """Sort real buses either by price ('cheapest') or by heuristic score ('best', default)."""
    if sort_by == "cheapest":
        return sorted(buses, key=lambda b: b.get("price", float("inf")))

    for bus in buses:
        bus["ai_score"] = heuristic_score(bus, preferences)
    return sorted(buses, key=lambda b: b.get("ai_score", 0), reverse=True)