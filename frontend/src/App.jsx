import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatbotWidget from './components/ChatbotWidget'
import Footer from './components/Footer'
import Home from './pages/Home'
import SearchBus from './pages/SearchBus'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import BusDetails from './pages/BusDetails'
import SeatSelection from './pages/SeatSelection'
import Payment from './pages/Payment'
import BookingConfirmation from './pages/BookingConfirmation'
import BookingHistory from './pages/BookingHistory'
import ForgotPassword from './pages/ForgotPassword'
import EmergencyReservation from './pages/EmergencyReservation'

function App() {
  const location = useLocation();
  const hideAuthShell = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className={hideAuthShell ? '' : 'pb-24'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search-bus" element={<SearchBus />} />
          <Route path="/emergency-reservation" element={<EmergencyReservation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bus-details/:busId" element={<BusDetails />} />
          <Route path="/seat-selection/:busId" element={<SeatSelection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideAuthShell && <Footer />}
      {!hideAuthShell && <ChatbotWidget />}
    </div>
  )
}

export default App
