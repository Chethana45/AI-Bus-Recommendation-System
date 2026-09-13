"""
AI Bus Booking Chatbot
───────────────────────
BusBuddy is the AI assistant for the Smart Bus Reservation application.

Search-type queries are grounded in REAL bus data retrieved through
the existing Node.js backend API.

Flow:
    User message
        ↓
    Gemini extracts search requirements
        ↓
    Real buses fetched from backend/MongoDB
        ↓
    Filters applied
        ↓
    Buses ranked
        ↓
    Gemini generates response using ONLY real bus data

General questions such as greetings, policies, and bus-type explanations
continue to use the normal Gemini conversational flow.
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import google.generativeai as genai
from dotenv import load_dotenv

from bus_data import (
    fetch_buses_from_db,
    filter_buses,
    sort_buses
)


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY not found in environment variables"
    )

genai.configure(api_key=GEMINI_API_KEY)


# ═══════════════════════════════════════════════════════════════════════════════
# GENERAL CHATBOT PROMPT
# ═══════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """
You are BusBuddy, an intelligent AI assistant for a bus booking platform
called "SmartBus".

Your role is to help users with:

1. BUS SEARCH
   Help users find buses based on route, price, bus type and amenities.

2. ROUTE INFORMATION
   Explain routes and general travel information.

3. PRICING
   Explain fares and general pricing questions.

4. POLICIES
   Explain cancellation, refund and baggage policies.

5. SEAT INFORMATION
   Explain Window, Aisle, Sleeper and Semi-Sleeper seats.

6. BUS TYPES
   Explain AC, Non-AC, Sleeper and Seater buses.

7. SUPPORT
   Help users with general bus-booking questions.

IMPORTANT:
- Be concise, friendly and helpful.
- Prices must be written in INR (₹).
- Never invent a specific bus, operator, fare or availability.
- If the user asks to search for a specific route, the system will retrieve
  real buses separately.
- If source or destination is missing for a search request, ask the user
  for the missing information.
- Keep responses under 150 words unless the user asks for more detail.

For general questions, finish your response with:

{"intent": "<one of: booking_query|route_info|pricing|cancellation|seat_info|complaint|general>"}

Known policies:
- Free cancellation up to 2 hours before departure
- 50% refund for cancellation within 2 hours
- No refund for no-shows
- 15 kg baggage allowed free
"""


# ═══════════════════════════════════════════════════════════════════════════════
# GEMINI EXTRACTION PROMPT
# ═══════════════════════════════════════════════════════════════════════════════

EXTRACTION_PROMPT_TEMPLATE = """
You are the query-understanding component of BusBuddy.

Analyze ONLY the user's latest message and the conversation context.

CONVERSATION SO FAR:
{history_str}

KNOWN SEARCH INFORMATION:
{known_slots}

LATEST USER MESSAGE:
"{message}"

Your job is to determine whether the user wants a BUS SEARCH.

Return ONLY structured JSON.

Rules:

1. is_search_query

Set true when the user wants to:
- find buses
- search buses
- book/search a bus
- recommend a bus
- find the cheapest bus
- find a specific bus type
- find a bus with amenities
- ask which bus is available for a route
- ask for the best bus
- ask for a bus under a certain price

Set false for:
- greetings
- thanks
- general explanations
- "what is a sleeper bus?"
- cancellation policy questions
- general bus information

2. source

Extract the starting city from the latest message.

Examples:
"from Bangalore" -> "Bangalore"
"starting from Mumbai" -> "Mumbai"

If the latest message does not mention a new source,
return an empty string.

3. destination

Extract the destination city from the latest message.

Examples:
"to Hyderabad" -> "Hyderabad"
"Bangalore to Hyderabad" -> "Hyderabad"

If the latest message does not mention a new destination,
return an empty string.

4. bus_type

Only use:
- AC
- Non-AC
- Sleeper
- Seater

Examples:
"AC bus" -> "AC"
"non AC bus" -> "Non-AC"
"sleeper bus" -> "Sleeper"
"seater bus" -> "Seater"

Do NOT use Volvo as a bus_type.

If not specified, return an empty string.

5. amenities

Only use these canonical names:
- WiFi
- Charging Point
- Blanket
- Water Bottle
- Snacks
- Reading Light

Only include amenities explicitly requested by the user.

Examples:
"with wifi" -> ["WiFi"]
"with charging" -> ["Charging Point"]
"wifi and charging" -> ["WiFi", "Charging Point"]

If none are requested, return [].

6. max_price

Extract the maximum price.

Examples:
"under 500" -> "500"
"below ₹700" -> "700"
"less than 1000 rupees" -> "1000"

If no maximum price is given, return an empty string.

7. sort_by

Use "cheapest" when the user says:
- cheap
- cheapest
- low cost
- budget
- inexpensive
- lowest price

Use "best" when the user says:
- best
- recommend
- recommendation
- suggest the best

Otherwise return an empty string.

8. CONTEXT

If the latest message says:

"cheapest one"

and the previous conversation already established:

Bangalore -> Hyderabad

return source and destination as empty strings.

The application will merge them with known session information.

Do not invent cities or preferences.
"""


# ═══════════════════════════════════════════════════════════════════════════════
# GROUNDED RESPONSE PROMPT
# ═══════════════════════════════════════════════════════════════════════════════

GROUNDED_PROMPT_TEMPLATE = """
You are BusBuddy, the AI assistant for the SmartBus bus booking platform.

Answer the user's request using ONLY the real bus data supplied below.

NEVER invent:
- bus names
- operators
- fares
- departure times
- arrival times
- available seats
- amenities
- ratings

USER MESSAGE:
"{message}"

SEARCH INFORMATION:
Route: {source} -> {destination}
Bus type: {bus_type}
Amenities: {amenities}
Maximum price: {max_price}
Sort preference: {sort_by}

REAL BUSES:
{buses_json}

Rules:

1. If REAL BUSES is empty:
   Say honestly that no matching buses were found in the system.

2. If buses are available:
   Recommend 1 to 3 actual buses from the list.

3. For each recommendation:
   Mention the actual bus name/operator, bus type and fare.

4. If relevant, mention:
   - departure
   - arrival
   - duration
   - available seats
   - requested amenities

5. If sort preference is "cheapest":
   The first recommendation MUST be the lowest-price bus
   in the supplied list.

6. Never create information that is not present in REAL BUSES.

7. Keep the response friendly and under 130 words.

8. Do not add JSON.

9. Do not use markdown headings.
"""


# ═══════════════════════════════════════════════════════════════════════════════
# CLARIFICATION MESSAGES
# ═══════════════════════════════════════════════════════════════════════════════

CLARIFY_MISSING_BOTH = (
    "I'd love to help you find a bus! "
    "Could you tell me your starting city and destination?"
)

CLARIFY_MISSING_DEST = (
    "Got it, from {source}! "
    "Where would you like to go?"
)

CLARIFY_MISSING_SOURCE = (
    "Sure! Where are you traveling from, "
    "to reach {destination}?"
)


# ═══════════════════════════════════════════════════════════════════════════════
# CHATBOT CLASS
# ═══════════════════════════════════════════════════════════════════════════════

class BusBookingChatbot:

    def __init__(self):

        # ───────────────────────────────────────────────────────────────────────
        # Normal conversational Gemini model
        # ───────────────────────────────────────────────────────────────────────

        self.model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 1024,
            },
        )

        # ───────────────────────────────────────────────────────────────────────
        # Structured extraction model
        #
        # IMPORTANT:
        # We use a response schema so Gemini MUST return complete JSON.
        # Empty strings are used instead of null for optional values.
        # This makes the legacy google.generativeai SDK much more reliable.
        # ───────────────────────────────────────────────────────────────────────

        self.extraction_model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.0,
                "max_output_tokens": 1000,
                "response_mime_type": "application/json",

                "response_schema": {
                    "type": "object",
                    "properties": {
                        "is_search_query": {
                            "type": "boolean"
                        },
                        "source": {
                            "type": "string"
                        },
                        "destination": {
                            "type": "string"
                        },
                        "date": {
                            "type": "string"
                        },
                        "bus_type": {
                            "type": "string"
                        },
                        "amenities": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        },
                        "max_price": {
                            "type": "string"
                        },
                        "sort_by": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "is_search_query",
                        "source",
                        "destination",
                        "date",
                        "bus_type",
                        "amenities",
                        "max_price",
                        "sort_by"
                    ]
                }
            },
        )

        # session_id -> Gemini conversation history
        self._sessions: Dict[str, List[dict]] = {}

        # session_id -> remembered search information
        self._slots: Dict[str, Dict] = {}


    # ═══════════════════════════════════════════════════════════════════════════
    # SESSION HELPERS
    # ═══════════════════════════════════════════════════════════════════════════

    def _get_or_create_session(
        self,
        session_id: str
    ) -> List[dict]:

        if session_id not in self._sessions:
            self._sessions[session_id] = []

        return self._sessions[session_id]


    def _get_slots(
        self,
        session_id: str
    ) -> Dict:

        if session_id not in self._slots:

            self._slots[session_id] = {
                "source": None,
                "destination": None,
                "date": None,
                "bus_type": None,
                "amenities": [],
                "max_price": None,
                "sort_by": None,
            }

        return self._slots[session_id]


    # ═══════════════════════════════════════════════════════════════════════════
    # PARSE INTENT FROM GENERAL GEMINI RESPONSE
    # ═══════════════════════════════════════════════════════════════════════════

    def _parse_intent(
        self,
        text: str
    ) -> Tuple[str, str]:

        intent = "general"
        clean_text = text

        try:

            if '{"intent":' in text:

                start = text.rfind('{"intent":')

                json_str = text[start:]

                end = json_str.find("}") + 1

                intent_data = json.loads(
                    json_str[:end]
                )

                intent = intent_data.get(
                    "intent",
                    "general"
                )

                clean_text = text[:start].strip()

        except (
            json.JSONDecodeError,
            ValueError
        ):
            pass

        return clean_text, intent


    # ═══════════════════════════════════════════════════════════════════════════
    # BUILD GENERAL GEMINI CONVERSATION
    # ═══════════════════════════════════════════════════════════════════════════

    def _build_context_message(
        self,
        history: List[dict],
        new_message: str
    ) -> List[dict]:

        messages = []

        if not history:

            messages.append({
                "role": "user",
                "parts": [SYSTEM_PROMPT]
            })

            messages.append({
                "role": "model",
                "parts": [
                    "Understood! I'm BusBuddy, ready to help "
                    "with bus bookings, route information, pricing "
                    "and more."
                ]
            })

        messages.extend(history)

        messages.append({
            "role": "user",
            "parts": [new_message]
        })

        return messages


    # ═══════════════════════════════════════════════════════════════════════════
    # CONVERT HISTORY INTO TEXT FOR EXTRACTION
    # ═══════════════════════════════════════════════════════════════════════════

    def _history_to_text(
        self,
        history: List[dict],
        max_turns: int = 6
    ) -> str:

        if not history:
            return "(no prior messages)"

        recent = history[-max_turns:]

        lines = []

        for msg in recent:

            role = (
                "User"
                if msg.get("role") == "user"
                else "BusBuddy"
            )

            parts = msg.get("parts", [])

            text = (
                parts[0]
                if parts
                else ""
            )

            if text == SYSTEM_PROMPT:
                continue

            if "ready to help with bus bookings" in text:
                continue

            lines.append(
                f"{role}: {text}"
            )

        return (
            "\n".join(lines)
            if lines
            else "(no prior messages)"
        )


    # ═══════════════════════════════════════════════════════════════════════════
    # NORMALIZE EXTRACTED DATA
    # ═══════════════════════════════════════════════════════════════════════════

    def _normalize_extracted(
        self,
        extracted: Dict
    ) -> Dict:

        # Ensure dictionary
        if not isinstance(extracted, dict):
            raise ValueError(
                "Gemini extraction result is not an object"
            )

        # Normalize strings
        for key in [
            "source",
            "destination",
            "date",
            "bus_type",
            "sort_by"
        ]:

            value = extracted.get(key)

            if value is None:
                extracted[key] = ""

            elif not isinstance(value, str):
                extracted[key] = str(value).strip()

            else:
                extracted[key] = value.strip()

        # Normalize amenities
        amenities = extracted.get("amenities")

        if not isinstance(amenities, list):
            amenities = []

        extracted["amenities"] = [
            str(a).strip()
            for a in amenities
            if str(a).strip()
        ]

        # Normalize max_price
        max_price = extracted.get("max_price")

        if max_price is None:
            extracted["max_price"] = None

        elif isinstance(max_price, (int, float)):

            extracted["max_price"] = int(
                max_price
            )

        else:

            max_price_text = str(
                max_price
            ).strip()

            if not max_price_text:
                extracted["max_price"] = None

            else:

                # Keep only digits
                digits = "".join(
                    ch
                    for ch in max_price_text
                    if ch.isdigit()
                )

                if digits:
                    extracted["max_price"] = int(
                        digits
                    )
                else:
                    extracted["max_price"] = None

        # Normalize search flag
        extracted["is_search_query"] = bool(
            extracted.get(
                "is_search_query",
                False
            )
        )

        return extracted


    # ═══════════════════════════════════════════════════════════════════════════
    # EXTRACT STRUCTURED SEARCH INFORMATION
    # ═══════════════════════════════════════════════════════════════════════════

    async def _extract_query_info(
        self,
        session_id: str,
        history: List[dict],
        message: str
    ) -> Dict:

        known = self._get_slots(
            session_id
        )

        prompt = EXTRACTION_PROMPT_TEMPLATE.format(
            history_str=self._history_to_text(
                history
            ),

            known_slots=json.dumps(
                known,
                ensure_ascii=False
            ),

            message=message
        )

        loop = asyncio.get_event_loop()

        response = await loop.run_in_executor(
            None,
            lambda: self.extraction_model.generate_content(
                prompt
            )
        )

        # Gemini structured output should already be JSON.
        raw = response.text.strip()

        print(
            "🧠 Gemini extraction raw:",
            raw
        )

        if not raw:
            raise ValueError(
                "Gemini returned an empty extraction response"
            )

        # Safety handling in case markdown fences appear.
        if raw.startswith("```"):

            raw = raw.replace(
                "```json",
                ""
            )

            raw = raw.replace(
                "```",
                ""
            )

            raw = raw.strip()

        # Handle accidental text around JSON.
        start = raw.find("{")
        end = raw.rfind("}")

        if start == -1 or end == -1:

            raise ValueError(
                "Gemini did not return complete JSON. "
                f"Response: {raw}"
            )

        raw = raw[
            start:end + 1
        ]

        try:

            extracted = json.loads(
                raw
            )

        except json.JSONDecodeError as e:

            raise ValueError(
                f"Invalid Gemini JSON: {e}. "
                f"Response: {raw}"
            )

        extracted = self._normalize_extracted(
            extracted
        )

        return extracted


    # ═══════════════════════════════════════════════════════════════════════════
    # MERGE EXTRACTED INFORMATION INTO SESSION
    # ═══════════════════════════════════════════════════════════════════════════

    def _merge_slots(
        self,
        session_id: str,
        extracted: Dict
    ) -> Dict:

        slots = self._get_slots(
            session_id
        )

        # Source
        if extracted.get("source"):

            slots["source"] = (
                extracted["source"]
            )

        # Destination
        if extracted.get("destination"):

            slots["destination"] = (
                extracted["destination"]
            )

        # Date
        if extracted.get("date"):

            slots["date"] = (
                extracted["date"]
            )

        # Bus type
        if extracted.get("bus_type"):

            slots["bus_type"] = (
                extracted["bus_type"]
            )

        # Maximum price
        if extracted.get("max_price") is not None:

            slots["max_price"] = (
                extracted["max_price"]
            )

        # Sort preference
        if extracted.get("sort_by"):

            slots["sort_by"] = (
                extracted["sort_by"]
            )

        # Amenities
        new_amenities = (
            extracted.get("amenities")
            or []
        )

        if new_amenities:

            existing_lower = {
                str(a).lower()
                for a in slots.get(
                    "amenities",
                    []
                )
            }

            for amenity in new_amenities:

                amenity_lower = str(
                    amenity
                ).lower()

                if amenity_lower not in existing_lower:

                    slots.setdefault(
                        "amenities",
                        []
                    ).append(
                        amenity
                    )

                    existing_lower.add(
                        amenity_lower
                    )

        self._slots[session_id] = slots

        return slots


    # ═══════════════════════════════════════════════════════════════════════════
    # GENERATE GROUNDED RESPONSE
    # ═══════════════════════════════════════════════════════════════════════════

    async def _generate_grounded_reply(
        self,
        message: str,
        slots: Dict,
        buses: List[Dict]
    ) -> str:

        # Only provide a small relevant set to Gemini.
        top_buses = buses[:5]

        buses_json = json.dumps(
            [
                {
                    "busName": b.get(
                        "busName"
                    ),

                    "operator": b.get(
                        "operator"
                    ),

                    "bus_type": b.get(
                        "bus_type"
                    ),

                    "from": b.get(
                        "source"
                    ),

                    "to": b.get(
                        "destination"
                    ),

                    "departure": b.get(
                        "departure"
                    ),

                    "arrival": b.get(
                        "arrival"
                    ),

                    "duration": b.get(
                        "duration"
                    ),

                    "fare": b.get(
                        "price"
                    ),

                    "rating": b.get(
                        "rating"
                    ),

                    "seats_available": b.get(
                        "seats_available"
                    ),

                    "amenities": b.get(
                        "amenities"
                    ),
                }

                for b in top_buses
            ],
            indent=2,
            ensure_ascii=False
        )

        prompt = GROUNDED_PROMPT_TEMPLATE.format(

            message=message,

            source=(
                slots.get("source")
                or "unspecified"
            ),

            destination=(
                slots.get("destination")
                or "unspecified"
            ),

            bus_type=(
                slots.get("bus_type")
                or "any"
            ),

            amenities=(
                ", ".join(
                    slots.get(
                        "amenities"
                    )
                    or []
                )
                or "none specified"
            ),

            max_price=(
                slots.get("max_price")
                if slots.get(
                    "max_price"
                ) is not None
                else "no limit"
            ),

            sort_by=(
                slots.get("sort_by")
                or "best overall"
            ),

            buses_json=buses_json
        )

        loop = asyncio.get_event_loop()

        response = await loop.run_in_executor(
            None,
            lambda: self.model.generate_content(
                prompt
            )
        )

        return response.text.strip()


    # ═══════════════════════════════════════════════════════════════════════════
    # MAIN MESSAGE PROCESSOR
    # ═══════════════════════════════════════════════════════════════════════════

    async def process_message(
        self,
        session_id: str,
        message: str
    ) -> dict:

        history = self._get_or_create_session(
            session_id
        )

        # ───────────────────────────────────────────────────────────────────────
        # 1. Extract user requirements
        # ───────────────────────────────────────────────────────────────────────

        extracted = None

        try:

            extracted = await self._extract_query_info(
                session_id,
                history,
                message
            )

            print(
                "🔍 BusBuddy extracted:",
                json.dumps(
                    extracted,
                    ensure_ascii=False
                )
            )

        except Exception as e:

            print(
                f"⚠️ BusBuddy extraction failed: {e}"
            )


        # ───────────────────────────────────────────────────────────────────────
        # 2. Decide whether this is a search
        # ───────────────────────────────────────────────────────────────────────

        is_search_query = bool(
            extracted
            and extracted.get(
                "is_search_query",
                False
            )
        )


        # ═══════════════════════════════════════════════════════════════════════
        # 3. SEARCH FLOW
        # ═══════════════════════════════════════════════════════════════════════

        if is_search_query:

            slots = self._merge_slots(
                session_id,
                extracted
            )

            source = slots.get(
                "source"
            )

            destination = slots.get(
                "destination"
            )


            # ───────────────────────────────────────────────────────────────────
            # Missing route information
            # ───────────────────────────────────────────────────────────────────

            if not source or not destination:

                if (
                    not source
                    and not destination
                ):

                    clean_text = (
                        CLARIFY_MISSING_BOTH
                    )

                elif not destination:

                    clean_text = (
                        CLARIFY_MISSING_DEST.format(
                            source=source
                        )
                    )

                else:

                    clean_text = (
                        CLARIFY_MISSING_SOURCE.format(
                            destination=destination
                        )
                    )

                intent = "booking_query"


            # ───────────────────────────────────────────────────────────────────
            # Route is available
            # ───────────────────────────────────────────────────────────────────

            else:

                print(
                    f"🚌 Searching real buses: "
                    f"{source} -> {destination}"
                )


                # ───────────────────────────────────────────────────────────────
                # Fetch REAL buses from Node backend
                # ───────────────────────────────────────────────────────────────

                all_buses = fetch_buses_from_db(
                    source,
                    destination
                )

                print(
                    f"🚌 Real buses received: "
                    f"{len(all_buses)}"
                )


                # ───────────────────────────────────────────────────────────────
                # Apply filters
                # ───────────────────────────────────────────────────────────────

                filtered = filter_buses(
                    all_buses,

                    bus_type=slots.get(
                        "bus_type"
                    ),

                    max_price=slots.get(
                        "max_price"
                    ),

                    amenities=slots.get(
                        "amenities"
                    )
                )

                print(
                    f"🔎 Buses after filtering: "
                    f"{len(filtered)}"
                )


                # IMPORTANT:
                # NEVER fall back to all_buses here.
                #
                # If user asks:
                # "Non-AC under 500 with WiFi"
                #
                # and no bus matches,
                # we must NOT show unrelated buses.

                buses_for_reply = filtered


                # ───────────────────────────────────────────────────────────────
                # Sort / rank real buses
                # ───────────────────────────────────────────────────────────────

                ranked = sort_buses(
                    buses_for_reply,

                    sort_by=slots.get(
                        "sort_by"
                    ),

                    preferences=slots.get(
                        "amenities"
                    )
                )

                print(
                    f"🏆 Buses after ranking: "
                    f"{len(ranked)}"
                )


                # ───────────────────────────────────────────────────────────────
                # Generate grounded response
                # ───────────────────────────────────────────────────────────────

                try:

                    if not ranked:

                        clean_text = (
                            f"I couldn't find any buses "
                            f"from {source} to {destination} "
                            f"matching your current filters."
                        )


                        if (
                            slots.get(
                                "max_price"
                            )
                            is not None
                        ):

                            clean_text += (
                                " You can try increasing "
                                "your price limit."
                            )

                        elif slots.get(
                            "amenities"
                        ):

                            clean_text += (
                                " You can try relaxing "
                                "one of the amenity requirements."
                            )


                    else:

                        clean_text = (
                            await self._generate_grounded_reply(
                                message,
                                slots,
                                ranked
                            )
                        )


                except Exception as e:

                    print(
                        f"⚠️ Grounded response failed: {e}"
                    )


                    # ───────────────────────────────────────────────────────────
                    # SAFE FALLBACK
                    #
                    # Uses ONLY actual database results.
                    # ───────────────────────────────────────────────────────────

                    if not ranked:

                        clean_text = (
                            f"I couldn't find any buses "
                            f"from {source} to {destination} "
                            f"in our system right now."
                        )

                    else:

                        lines = [
                            f"Here are real buses from "
                            f"{source} to {destination}:"
                        ]

                        for bus in ranked[:3]:

                            bus_name = (
                                bus.get(
                                    "busName"
                                )
                                or bus.get(
                                    "operator"
                                )
                                or "Bus"
                            )

                            bus_type = (
                                bus.get(
                                    "bus_type"
                                )
                                or "Unknown"
                            )

                            price = bus.get(
                                "price",
                                0
                            )

                            seats = bus.get(
                                "seats_available",
                                0
                            )

                            lines.append(
                                f"- {bus_name} "
                                f"({bus_type}) — "
                                f"₹{price}, "
                                f"{seats} seats available"
                            )

                        clean_text = (
                            "BusBuddy AI is currently unavailable. "
                            "Please use normal bus search."
                        )

                intent = "booking_query"


        # ═══════════════════════════════════════════════════════════════════════
        # 4. GENERAL / FAQ FLOW
        # ═══════════════════════════════════════════════════════════════════════

        else:

            messages = self._build_context_message(
                history,
                message
            )

            loop = asyncio.get_event_loop()

            try:
                response = await loop.run_in_executor(
                    None,
                    lambda: self.model.generate_content(
                        messages
                    )
                )

                raw_text = response.text

                clean_text, intent = (
                    self._parse_intent(
                        raw_text
                    )
                )
            except Exception as e:
                print(f"BusBuddy Gemini conversation failed: {e}")
                clean_text = (
                    "BusBuddy AI is currently unavailable. "
                    "Please use normal bus search."
                )
                intent = "general"


        # ═══════════════════════════════════════════════════════════════════════
        # 5. SAVE CONVERSATION HISTORY
        # ═══════════════════════════════════════════════════════════════════════

        history.append({
            "role": "user",
            "parts": [message]
        })

        history.append({
            "role": "model",
            "parts": [clean_text]
        })

        self._sessions[session_id] = history


        # ═══════════════════════════════════════════════════════════════════════
        # 6. RETURN API RESPONSE
        # ═══════════════════════════════════════════════════════════════════════

        return {
            "response": clean_text,
            "intent": intent,
            "timestamp": datetime.now().isoformat()
        }


    # ═══════════════════════════════════════════════════════════════════════════
    # HISTORY API
    # ═══════════════════════════════════════════════════════════════════════════

    def get_history(
        self,
        session_id: str
    ) -> Optional[List[dict]]:

        if session_id not in self._sessions:
            return None

        return [
            {
                "role": msg["role"],
                "content": (
                    msg["parts"][0]
                    if msg.get("parts")
                    else ""
                )
            }

            for msg in self._sessions[
                session_id
            ]
        ]


    # ═══════════════════════════════════════════════════════════════════════════
    # CLEAR SESSION
    # ═══════════════════════════════════════════════════════════════════════════

    def clear_history(
        self,
        session_id: str
    ) -> None:

        self._sessions.pop(
            session_id,
            None
        )

        self._slots.pop(
            session_id,
            None
        )


    # ═══════════════════════════════════════════════════════════════════════════
    # ACTIVE SESSIONS
    # ═══════════════════════════════════════════════════════════════════════════

    def get_active_sessions(
        self
    ) -> List[str]:

        return list(
            self._sessions.keys()
        )


    # ═══════════════════════════════════════════════════════════════════════════
    # QUICK REPLY SUGGESTIONS
    # ═══════════════════════════════════════════════════════════════════════════

    async def get_quick_reply_suggestions(
        self,
        intent: str
    ) -> List[str]:

        suggestions_map = {

            "booking_query": [
                "Search buses for tomorrow",
                "Check seat availability",
                "Best buses for Bangalore → Chennai"
            ],

            "pricing": [
                "Show cheapest options",
                "Are there any discounts?",
                "What's included in the fare?"
            ],

            "cancellation": [
                "How to cancel my ticket?",
                "What's the refund policy?",
                "Cancel my booking"
            ],

            "route_info": [
                "How long is the journey?",
                "Are there food stops?",
                "Show me the route map"
            ],

            "seat_info": [
                "What's a sleeper bus?",
                "Window vs Aisle seat",
                "Show available seats"
            ],

            "general": [
                "Book a bus ticket",
                "Track my bus",
                "Contact support"
            ],
        }

        return suggestions_map.get(
            intent,
            suggestions_map["general"]
        )