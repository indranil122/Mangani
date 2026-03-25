import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchChapterPages } from '../services/api';
import './Reader.css';

export default function Reader() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    fetchChapterPages(chapterId)
      .then(setPages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [chapterId]);

  const hideControlsTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setControlsVisible(true);
    timerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  useEffect(() => {
    hideControlsTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hideControlsTimer]);

  // Track scroll progress 
  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollRatio = scrollTop / (scrollHeight - clientHeight || 1);
      const pageIdx = Math.round(scrollRatio * (pages.length - 1));
      setCurrentPage(pageIdx);
      hideControlsTimer();
    };
    const el = containerRef.current;
    el?.addEventListener('scroll', onScroll, { passive: true });
    return () => el?.removeEventListener('scroll', onScroll);
  }, [pages, hideControlsTimer]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const progress = pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0;

  if (loading) {
    return (
      <div className="reader-loading">
        <div className="spinner" />
        <p>Loading pages…</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="reader-empty container">
        <h2>No pages found</h2>
        <p>This chapter might not be available or contains no external images.</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div
      className="reader"
      onMouseMove={hideControlsTimer}
      onClick={hideControlsTimer}
    >
      {/* Progress bar */}
      <div className="reader__progress">
        <div className="reader__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Top controls */}
      <div className={`reader__controls reader__controls--top ${controlsVisible ? 'visible' : ''}`}>
        <button className="reader__back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div className="reader__page-info">
          {currentPage + 1} / {pages.length}
        </div>
      </div>

      {/* Pages */}
      <div className="reader__pages" ref={containerRef}>
        {pages.map((url, i) => (
          <div key={i} className="reader__page-wrapper">
            <img
              src={url}
              alt={`Page ${i + 1}`}
              className="reader__page-img"
              loading={i < 3 ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
            />
          </div>
        ))}

        <div className="reader__end">
          <p>End of Chapter</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>
            Back to Details
          </button>
        </div>
      </div>
    </div>
  );
}
