import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <nav className={`navbar glass ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
              <path d="M8 24V8h4l4 8 4-8h4v16h-4V14l-4 8-4-8v10H8z" fill="white" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6c5ce7" />
                  <stop offset="1" stopColor="#fd79a8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar__title">MangaVerse</span>
        </Link>

        <div className="navbar__links">
          <Link to="/" className="navbar__link">Home</Link>
          <Link to="/browse" className="navbar__link">Browse</Link>
        </div>

        <div className="navbar__actions">
          <form
            className={`navbar__search ${isSearchOpen ? 'navbar__search--open' : ''}`}
            onSubmit={handleSearch}
          >
            <input
              ref={inputRef}
              type="text"
              className="navbar__search-input"
              placeholder="Search manga..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => {
                if (!query) setIsSearchOpen(false);
              }}
            />
            <button
              type="button"
              className="navbar__search-btn"
              onClick={() => {
                if (isSearchOpen && query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  setIsSearchOpen(false);
                  setQuery('');
                } else {
                  setIsSearchOpen(!isSearchOpen);
                }
              }}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
