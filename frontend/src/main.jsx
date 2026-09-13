import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import './App.css'
import './navbar.css'
import './home.css'
import './search.css'
import './forms.css'
import './busdetails.css'
import './seatselection.css'
import './profile-history.css'
import './chatbot.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
