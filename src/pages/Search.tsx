import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchManga, type MangaItem } from '../services/api';
import MangaCard from '../components/MangaCard';
import './Search.css';

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [results, setResults] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query) { setLoading(false); return; }
    setLoading(true);
    searchManga(query, 30)
      .then((res) => {
        setResults(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="search page-enter container">
      <div className="search__header">
        <h1>Search Results</h1>
        <p className="search__meta">
          {loading ? 'Searching…' : `${total} results for "${query}"`}
        </p>
      </div>

      {loading ? (
        <div className="manga-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="manga-card-skeleton">
              <div className="skeleton" style={{ aspectRatio: '3/4' }} />
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                <div className="skeleton" style={{ height: '12px', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="search__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h2>No results found</h2>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div className="manga-grid">
          {results.map((manga, i) => (
            <MangaCard key={manga.id} manga={manga} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
