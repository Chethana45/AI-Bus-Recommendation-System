import { ArrowRight } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-shell">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo-shell">
            <ArrowRight size={24} />
          </div>
          <div>
            <p className="footer-brand-tag">BusBook</p>
            <h2 className="footer-brand-title">Premium journeys, every seat.</h2>
          </div>
        </div>
        <p className="footer-copy">Experience modern, fast and reliable bus booking with premium routes, secure checkout, and AI-powered route guidance.</p>
      </div>

      <div className="footer-grid">
        <div>
          <h3>Company</h3>
          <Link to="/" className="footer-link">About</Link>
          <Link to="/" className="footer-link">Careers</Link>
          <Link to="/" className="footer-link">Blog</Link>
        </div>
        <div>
          <h3>Support</h3>
          <Link to="/" className="footer-link">Help Center</Link>
          <Link to="/" className="footer-link">Terms</Link>
          <Link to="/" className="footer-link">Privacy</Link>
        </div>
        <div>
          <h3>Connect</h3>
          <p className="footer-text">Follow us for flash offers and new routes.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter" className="social-icon"><FaTwitter size={18} /></a>
            <a href="#" aria-label="Instagram" className="social-icon"><FaInstagram size={18} /></a>
            <a href="#" aria-label="Facebook" className="social-icon"><FaFacebookF size={18} /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 BusBook. Built for premium journeys.</p>
        <p>Designed with intuition and reliability in mind.</p>
      </div>
    </footer>
  );
};

export default Footer;
