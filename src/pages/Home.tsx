import { useEffect, useState } from 'react';
import { fetchPopularManga, fetchRecentManga, type MangaItem } from '../services/api';
import MangaCard from '../components/MangaCard';
import './Home.css';

type Tab = 'popular' | 'recent';

export default function Home() {
  const [mangaList, setMangaList] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('popular');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const fn = tab === 'popular' ? fetchPopularManga : fetchRecentManga;
    fn(limit, page * limit)
      .then((res) => {
        setMangaList(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="home page-enter">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>
        <div className="hero__content container">
          <span className="hero__badge badge badge-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Discover Manga
          </span>
          <h1 className="hero__title">
            Your Gateway to <span>Manga Universe</span>
          </h1>
          <p className="hero__subtitle">
            Explore thousands of manga titles, read chapters, and discover your next favorite series — all in one beautiful place.
          </p>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">80K+</span>
              <span className="hero__stat-label">Titles</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">2M+</span>
              <span className="hero__stat-label">Chapters</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-value">Free</span>
              <span className="hero__stat-label">Forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* Manga Grid Section */}
      <section className="manga-section container">
        <div className="manga-section__header">
          <div className="manga-section__title-group">
            <h2 className="section-title">
              <span>{tab === 'popular' ? 'Popular' : 'Latest'}</span> Manga
            </h2>
            <p className="manga-section__desc">
              {tab === 'popular' ? 'Most followed manga of all time' : 'Recently updated manga'}
            </p>
          </div>

          <div className="manga-section__controls">
            <div className="type-tabs">
              <button
                className={`type-tab ${tab === 'popular' ? 'type-tab--active' : ''}`}
                onClick={() => { setTab('popular'); setPage(0); }}
              >
                Popular
              </button>
              <button
                className={`type-tab ${tab === 'recent' ? 'type-tab--active' : ''}`}
                onClick={() => { setTab('recent'); setPage(0); }}
              >
                Latest
              </button>
            </div>
          </div>
        </div>

        {/* Manga Grid */}
        {loading ? (
          <div className="manga-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="manga-card-skeleton">
                <div className="skeleton" style={{ aspectRatio: '3/4' }} />
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '12px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="manga-grid">
            {mangaList.map((manga, i) => (
              <MangaCard key={manga.id} manga={manga} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination__btn"
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Previous
            </button>

            <div className="pagination__info">
              <span className="pagination__current">{page + 1}</span>
              <span className="pagination__sep">/</span>
              <span className="pagination__total">{Math.min(totalPages, 50)}</span>
            </div>

            <button
              className="pagination__btn"
              disabled={page >= totalPages - 1 || page >= 49}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
