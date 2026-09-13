const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config({ path: path.resolve(__dirname, '.env') });

connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/buses', require('./src/routes/busRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/emergency', require('./src/routes/emergencyRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));

app.get('/', (req, res) => {
  res.json({
    message: 'Bus Booking Backend API is running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Bus Booking Backend',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});