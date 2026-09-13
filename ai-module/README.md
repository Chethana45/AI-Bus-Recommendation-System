# AI Module – Bus Booking Application

## Overview

The AI Module is responsible for providing intelligent assistance and smart recommendations within the Bus Booking Application. It enhances the user experience by offering AI-powered support, travel guidance, and personalized recommendations.

Bus search and recommendations use only bus records returned by the backend
configured through `MONGO_API_URL`. If no matching records exist, the module
returns a no-results response and never creates synthetic listings.

## Features

* AI Travel Assistant Chatbot
* Bus Recommendations Based on User Preferences
* Automated Frequently Asked Questions (FAQ) Support
* Travel Guidance and Route Suggestions
* Natural Language Query Handling

## Technologies Used

* Python
* Gemini API
* FastAPI / Flask
* REST APIs

## Project Structure

```text
ai-module/
│
├── app.py
├── chatbot.py
├── recommendation.py
├── requirements.txt
└── README.md
```

## Objectives

* Provide instant responses to user queries.
* Improve customer support through AI automation.
* Recommend suitable buses based on user requirements.
* Enhance the overall booking experience.

## Configuration

Create `.env` from `.env.example` and set `GEMINI_API_KEY`. The optional
`GEMINI_MODEL` setting defaults to `gemini-3.6-flash`. Set `MONGO_API_URL` to
the existing backend API, for example `http://localhost:3000/api`.

Run the service from this folder with:

```bash
pip install -r requirements.txt
python app.py
```

## Sample Queries

* Suggest buses from Chennai to Bangalore.
* What is the cancellation policy?
* Recommend AC buses under ₹1000.
* How can I reschedule my ticket?

## Future Enhancements

* Voice-based chatbot support
* Multilingual assistance
* Advanced recommendation engine
* Real-time travel insights

## Team Project

This module is a part of the AI-Powered Bus Booking Application developed as a collaborative project involving Frontend, Backend, and AI components.

## Author

Chethana Sri
AI Module Developer