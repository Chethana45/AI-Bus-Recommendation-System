import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: 'Hi! I am BusBuddy 🤖 powered by Google Gemini AI. I can help you find buses, check bookings, answer travel questions, and more. How can I assist you today?',
  },
];

const ChatbotWidget = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef(null);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen((current) => !current);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Try to call the backend AI chat endpoint
      const response = await api.post('/ai/chat', {
        session_id: sessionIdRef.current,
        message: trimmed,
      });

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data?.response || 'I received your message. How can I help you further?',
      };
      setMessages((current) => [...current, botMessage]);
    } catch (error) {
      // Fallback: if AI module is not running, use intelligent local responses
      const fallbackText = getFallbackResponse(trimmed);
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackText,
      };
      setMessages((current) => [...current, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
      <button 
        className={`chatbot-button ${isOpen ? 'open' : ''}`} 
        onClick={handleToggle}
      >
        {isOpen ? '×' : '💬'}
      </button>

      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div>
            <h4>BusBuddy AI</h4>
            <p>Powered by Gemini</p>
          </div>
          <button className="chatbot-close" onClick={handleToggle} aria-label="Close chat">
            ×
          </button>
        </div>

        <div className="chatbot-messages" ref={messagesRef}>
          {messages.map((message) => (
            <div key={message.id} className={`chat-message ${message.sender}`}>
              <div className="chat-bubble">{message.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="chat-message bot">
              <div className="chat-bubble typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
        </div>

        <form className="chatbot-input-area" onSubmit={handleSubmit}>
          <input
            className="chatbot-input"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask BusBuddy..."
            aria-label="Type a message"
          />
          <button type="submit" className="chatbot-send">➤</button>
        </form>
      </div>
    </div>
  );
};

function getFallbackResponse(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes('book') || normalized.includes('search')) {
    return 'To book a bus, use the search form above to enter your departure city, destination, and travel date. Then select a bus, choose seats, and proceed to payment.';
  }
  if (normalized.includes('help') || normalized.includes('how')) {
    return 'You can search buses by entering departure and destination cities, then select a bus and proceed to seat selection and payment. Try searching Mumbai → Pune or Delhi → Jaipur!';
  }
  if (normalized.includes('history') || normalized.includes('booking') || normalized.includes('ticket')) {
    return 'Your booking history is available on the Booking History page in your profile. You can view completed and cancelled trips there.';
  }
  if (normalized.includes('cancel')) {
    return 'To cancel a booking, go to Booking History, find your booking, and click Cancel. Free cancellation is available up to 2 hours before departure.';
  }
  if (normalized.includes('seat') || normalized.includes('select')) {
    return 'After choosing a bus, you can select your preferred seats from the interactive seat layout. Window seats are marked in green.';
  }
  if (normalized.includes('ac') || normalized.includes('non') || normalized.includes('sleeper') || normalized.includes('type')) {
    return 'We offer AC, Non-AC, Sleeper, and Seater buses. Use the filters on the search results page to narrow down by bus type and amenities like WiFi, Charging Point, Blanket, and Water Bottle.';
  }
  if (normalized.includes('price') || normalized.includes('fare') || normalized.includes('cost') || normalized.includes('cheap')) {
    return 'Bus fares vary by route and bus type. AC buses typically cost ₹400-1200, while Non-AC options start from ₹250. Use the search to see exact prices.';
  }
  if (normalized.includes('wifi') || normalized.includes('amenit')) {
    return 'Many of our buses offer amenities like WiFi, Charging Points, Blankets, Water Bottles, Snacks, and Reading Lights. Filter by amenities on the search results page.';
  }
  if (normalized.includes('route') || normalized.includes('go to') || normalized.includes('travel')) {
    return 'Popular routes include Mumbai ↔ Pune, Delhi ↔ Jaipur, Bangalore ↔ Hyderabad, Chennai ↔ Bangalore, and Ahmedabad ↔ Vadodara. Which route interests you?';
  }
  if (normalized.includes('refund') || normalized.includes('money')) {
    return 'Free cancellation is available up to 2 hours before departure. Cancellations within 2 hours get a 50% refund. No-shows are not eligible for refunds.';
  }
  if (normalized.includes('hi') || normalized.includes('hello') || normalized.includes('hey')) {
    return 'Hello! 👋 I\'m BusBuddy, your AI travel assistant. I can help you search buses, check fares, explain policies, and guide you through booking. What do you need help with?';
  }

  return 'Thanks for your question! I can help you with bus search, booking, seat selection, cancellation policies, amenities, and route information. Try asking: "Search buses from Mumbai to Pune" or "What amenities are available?"';
}

export default ChatbotWidget;