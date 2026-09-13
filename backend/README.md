\# Bus Booking App Backend



This backend is developed using Node.js, Express.js and MongoDB for the AI-Powered Bus Booking Application.



\## Features



\- User registration and login

\- JWT based authentication

\- Bus listing and route search

\- Bus details API

\- Ticket booking

\- Booking history

\- Booking cancellation

\- Payment record management

\- AI module integration routes for chatbot and recommendations



\## Tech Stack



\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT

\- Bcrypt.js

\- Axios

\- CORS

\- Dotenv



\## API Endpoints



\### Auth



POST /api/auth/register  

POST /api/auth/login  

GET /api/auth/me  



\### Buses



GET /api/buses  

GET /api/buses/:id  

POST /api/buses  



\### Bookings



GET /api/bookings  

GET /api/bookings/:id  

POST /api/bookings  

POST /api/bookings/:id/cancel  



\### Payments



POST /api/payments  

GET /api/payments  



\### AI



POST /api/ai/chat  

POST /api/ai/recommend  

GET /api/ai/routes/popular  



\## Run Backend



```bash

npm install

node server.js

