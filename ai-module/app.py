"""
AI-Powered Bus Booking Application
Main FastAPI Application Entry Point
"""
 
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
 
from chatbot import BusBookingChatbot
from recommendation import BusRecommendationEngine
 
# ── App Setup ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Bus Booking API",
    description="AI-powered bus booking assistant using Google Gemini",
    version="1.0.0",
)
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# ── Singletons ─────────────────────────────────────────────────────────────────
chatbot = BusBookingChatbot()
recommender = BusRecommendationEngine()
 
 
# ── Request / Response Models ──────────────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message: str
 
 
class ChatResponse(BaseModel):
    session_id: str
    response: str
    intent: Optional[str] = None
 
 
class RecommendationRequest(BaseModel):
    source: str
    destination: str
    date: str
    passengers: int = 1
    preferences: Optional[List[str]] = []   # e.g. ["AC", "Sleeper", "Window"]
 
 
class BusOption(BaseModel):
    bus_id: str
    operator: str
    departure: str
    arrival: str
    duration: str
    bus_type: str
    price: float
    seats_available: int
    rating: float
    amenities: List[str]
    ai_score: float
    recommendation_reason: str
 
 
class RecommendationResponse(BaseModel):
    source: str
    destination: str
    date: str
    recommendations: List[BusOption]
    ai_summary: str
 
 
class BookingRequest(BaseModel):
    bus_id: str
    passenger_name: str
    passenger_email: str
    passenger_phone: str
    seat_numbers: List[str]
    source: str
    destination: str
    journey_date: str
 
 
class BookingResponse(BaseModel):
    booking_id: str
    status: str
    message: str
    details: dict
 
 
# ── Endpoints ──────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Bus Booking API",
        "version": "1.0.0",
        "endpoints": {
            "chat":           "POST /chat",
            "recommend":      "POST /recommend",
            "book":           "POST /book",
            "chat_history":   "GET  /chat/history/{session_id}",
            "popular_routes": "GET  /routes/popular",
            "health":         "GET  /health",
        },
    }
 
 
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Bus Booking API"}
 
 
@app.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    """
    Chat with the AI booking assistant.
    Handles queries about routes, prices, bookings, policies, etc.
    """
    try:
        result = await chatbot.process_message(
            session_id=request.session_id,
            message=request.message,
        )
        return ChatResponse(
            session_id=request.session_id,
            response=result["response"],
            intent=result.get("intent"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
 
 
@app.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Retrieve conversation history for a session."""
    history = chatbot.get_history(session_id)
    if not history:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "history": history}
 
 
@app.delete("/chat/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear conversation history for a session."""
    chatbot.clear_history(session_id)
    return {"message": f"History cleared for session {session_id}"}
 
 
@app.post("/recommend", response_model=RecommendationResponse)
async def get_bus_recommendations(request: RecommendationRequest):
    """
    Get AI-powered bus recommendations for a route.
    Returns ranked options with scores and explanations.
    """
    try:
        result = await recommender.get_recommendations(
            source=request.source,
            destination=request.destination,
            date=request.date,
            passengers=request.passengers,
            preferences=request.preferences or [],
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")
 
 
@app.post("/book", response_model=BookingResponse)
async def book_bus(request: BookingRequest):
    """
    Confirm a bus booking.
    (In production this integrates with a real payment & seat-lock system.)
    """
    try:
        import uuid, random
        booking_id = f"BK{uuid.uuid4().hex[:8].upper()}"
        return BookingResponse(
            booking_id=booking_id,
            status="confirmed",
            message="Booking confirmed successfully! Check your email for the ticket.",
            details={
                "bus_id":       request.bus_id,
                "passenger":    request.passenger_name,
                "email":        request.passenger_email,
                "route":        f"{request.source} → {request.destination}",
                "date":         request.journey_date,
                "seats":        request.seat_numbers,
                "pnr":          f"PNR{random.randint(100000, 999999)}",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking error: {str(e)}")
 
 
@app.get("/routes/popular")
async def get_popular_routes():
    """Return a curated list of popular bus routes."""
    routes = [
        {"source": "Mumbai",    "destination": "Pune",       "distance": "150 km", "avg_duration": "3h",   "avg_price": 350},
        {"source": "Delhi",     "destination": "Agra",       "distance": "200 km", "avg_duration": "4h",   "avg_price": 400},
        {"source": "Bangalore", "destination": "Chennai",    "distance": "346 km", "avg_duration": "6h",   "avg_price": 600},
        {"source": "Hyderabad", "destination": "Bangalore",  "distance": "570 km", "avg_duration": "10h",  "avg_price": 900},
        {"source": "Kolkata",   "destination": "Bhubaneswar","distance": "440 km", "avg_duration": "8h",   "avg_price": 700},
        {"source": "Chennai",   "destination": "Coimbatore", "distance": "500 km", "avg_duration": "8h",   "avg_price": 650},
        {"source": "Jaipur",    "destination": "Delhi",      "distance": "280 km", "avg_duration": "5h",   "avg_price": 450},
        {"source": "Ahmedabad", "destination": "Mumbai",     "distance": "530 km", "avg_duration": "9h",   "avg_price": 800},
    ]
    return {"popular_routes": routes, "total": len(routes)}
 
 
# ── Dev Server ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
 