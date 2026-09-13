🚌 BUSBOOK
🤖 AI-Powered Smart Bus Reservation & Emergency Travel Platform

✨ Search Smarter • Travel Faster • Get AI-Powered Recommendations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 ABOUT THE PROJECT

BusBook is a full-stack smart bus reservation application designed to make bus travel across India simpler, faster, and more intelligent.

The platform combines a modern bus-booking interface with an 🤖 AI-powered BusBuddy assistant that understands natural-language travel requests and recommends buses using real bus data.

Users can:

🚌 Search for buses
🤖 Get AI-powered recommendations
🚨 Make priority/emergency reservations
👤 Manage their profile
📋 View booking history

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ KEY FEATURES
🚌 1. Smart Bus Search

🔹 Search buses by source and destination
🔹 Select a travel date
🔹 View complete route information
🔹 View departure and arrival times
🔹 Check journey duration
🔹 Check available seats
🔹 View bus type
🔹 Filter by AC / Non-AC
🔹 Filter by Seat / Sleeper
🔹 Filter by price
🔹 Filter by amenities

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 2. BusBuddy AI Assistant

BusBuddy is the AI-powered travel assistant integrated into BusBook.

Instead of manually selecting multiple filters, users can simply describe what they need.

💬 Example:

➡️ "I want a sleeper bus from Bangalore to Hyderabad with WiFi."

➡️ "Find me a cheap AC bus."

➡️ "Which is the cheapest bus?"

➡️ "I need a non-AC bus under ₹500."

🧠 BusBuddy can understand:

📍 Source
📍 Destination
📅 Travel Date
🚌 Bus Type
💰 Maximum Price
📶 Amenities
⭐ Sorting Preference

✅ The AI uses actual bus data for recommendations instead of generating fictional buses.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 3. Emergency / Priority Reservation

BusBook provides a dedicated Emergency / Priority Reservation feature for urgent travel.

It can be used for:

🏥 Medical emergencies
👨‍👩‍👧 Family emergencies
🎉 Festivals
💼 Urgent work
⚡ Last-minute travel

⚠️ Priority reservation does not create extra seats.

It provides a dedicated last-minute booking flow for buses with available seats.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 4. User Profile

The member dashboard allows users to view:

👤 Personal Information
🎟️ Total Bookings
✅ Completed Trips
📋 Booking History
⚙️ Account Settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 5. Reservation Flow

The application provides a complete reservation experience:

🚌 Bus Selection
💺 Seat Availability
👤 Passenger Information
✅ Booking Confirmation
📋 Booking History

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧠 HOW BUSBUDDY AI WORKS

BusBuddy follows an AI + Retrieval + Recommendation approach.

👤 User Request

⬇️

🤖 Gemini AI

⬇️

🧠 Extract User Preferences

⬇️

🗄️ Retrieve Real Bus Data

⬇️

🔎 Filter & Rank Buses

⬇️

⭐ Generate Recommendations

⬇️

💬 Display Results to User

💡 Example

👤 User:

"I need a sleeper bus from Bangalore to Hyderabad with WiFi."

BusBuddy:

1️⃣ Understands the request
2️⃣ 📍 Extracts Bangalore → Hyderabad
3️⃣ 🚌 Identifies Sleeper
4️⃣ 📶 Identifies WiFi preference
5️⃣ 🗄️ Retrieves matching bus data
6️⃣ 🔎 Filters available buses
7️⃣ ⭐ Ranks the buses
8️⃣ 💬 Returns suitable recommendations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ SYSTEM ARCHITECTURE

🎨 React Frontend

⬇️

⚙️ Node.js + Express Backend

⬇️

┌───────────────────────┐
│ │
🗄️ MongoDB 🤖 Python AI Module
│ │
└───────────────────────┘
⬇️
🧠 Gemini AI
⬇️
⭐ Recommendation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️ TECHNOLOGY STACK

🎨 Frontend: React + Vite

⚙️ Backend: Node.js + Express.js

🗄️ Database: MongoDB + Mongoose

🤖 AI Module: Python + FastAPI

🧠 AI: Google Gemini

🔗 Communication: REST APIs

🔐 Authentication: JWT

📦 Package Management: npm + pip

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 PROJECT STRUCTURE

📁 BusBookingApp-main

├── 📁 frontend/
├── 📁 backend/
├── 📁 ai-module/
└── 📄 README.md

🤖 AI Module

📁 ai-module/

├── 🐍 app.py
├── 🐍 chatbot.py
├── 🐍 bus_data.py
├── 🐍 recommendation.py
├── 📄 requirements.txt
└── 📄 ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 GETTING STARTED
1️⃣ Clone the Repository

🔗 GitHub:

Chethana45 / AI-Bus-Recommendation-System

2️⃣ Start the Backend

📁 Open the backend folder

npm install
node server.js

⚙️ Backend:

http://localhost:3000

3️⃣ Start the AI Module

📁 Open the AI module

pip install -r requirements.txt
python app.py

🤖 AI Module:

http://localhost:8000

4️⃣ Start the Frontend

📁 Open the frontend folder

npm install
npm run dev

🎨 Frontend:

http://localhost:5173

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 ENVIRONMENT VARIABLES
⚙️ Backend
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_MODULE_URL=http://localhost:8000
🤖 AI Module
GEMINI_API_KEY=your_gemini_api_key
MONGO_API_URL=http://localhost:3000/api

🔒 Never commit real API keys or .env files to GitHub.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 APPLICATION MODULES
🏠 Home Page

✨ Fast and simple interface for selecting:

📍 Source
📍 Destination
📅 Travel Date

and searching for available buses.

🔎 Search Bus Results

Displays:

🚌 Bus Name
📍 Route
🕐 Departure Time
🕐 Arrival Time
⏱️ Journey Duration
💺 Available Seats
⭐ Bus Rating
🏷️ Bus Type
🔍 Filtering Options

🚨 Emergency Reservation

Provides a dedicated interface for urgent travel and priority reservations.

🤖 BusBuddy AI

Allows users to communicate naturally and receive personalized bus recommendations.

👤 Member Dashboard

Provides:

👤 User Information
🎟️ Total Bookings
✅ Completed Trips
📋 Booking History
⚙️ Settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PROJECT HIGHLIGHTS

🌌 Modern dark-themed UI
🚌 Full-stack bus reservation system
🤖 AI-powered natural-language recommendations
🔎 Preference-based bus filtering
⭐ Intelligent bus ranking
🚨 Emergency reservation functionality
👤 User profile management
📋 Booking history
🗄️ MongoDB-backed application
🔗 React ↔ Express ↔ FastAPI integration
🧠 Gemini-powered BusBuddy assistant

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 SECURITY

Sensitive configuration is stored using environment variables.

🔑 Gemini API credentials
🗄️ MongoDB credentials
🔐 JWT secrets

⚠️ Never expose or commit real API keys to GitHub.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 FUTURE IMPROVEMENTS

💳 Production payment gateway integration
📱 Improved mobile responsiveness
🗺️ Live bus tracking
🔔 Booking notifications
🎙️ Voice interaction with BusBuddy
📊 Advanced personalized recommendations
☁️ Cloud deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div align="center">
🚌 BUSBOOK
✨ Smart Travel • Better Recommendations • Easier Reservations ✨

⭐ If you like this project, give it a star!

</div>
