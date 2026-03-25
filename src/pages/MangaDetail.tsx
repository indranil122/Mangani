import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMangaDetail, fetchChapters, type MangaDetail as MangaDetailType, type Chapter } from '../services/api';
import './MangaDetail.css';

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<MangaDetailType | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMangaDetail(id)
      .then(setManga)
      .catch(console.error)
      .finally(() => setLoading(false));

    setChaptersLoading(true);
    fetchChapters(id, 500)
      .then((res) => setChapters(res.data))
      .catch(console.error)
      .finally(() => setChaptersLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner" />
        <p>Loading manga details…</p>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="detail-error container">
        <h2>Manga not found</h2>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="detail-page page-enter">
      {/* Banner */}
      <div className="detail-banner">
        <div className="detail-banner__bg">
          {manga.coverUrl && (
            <img src={manga.coverUrl} alt="" className="detail-banner__bg-img" />
          )}
        </div>
        <div className="detail-banner__overlay" />
      </div>

      <div className="detail-content container">
        {/* Header */}
        <div className="detail-top">
          <div className="detail-cover">
            <img
              src={manga.coverUrl}
              alt={manga.title}
              className="detail-cover__img"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YxZjNmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGI4YmEzIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
              }}
            />
          </div>

          <div className="detail-info">
            <h1 className="detail-info__title">{manga.title}</h1>

            <div className="detail-info__meta">
              <span className="detail-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {manga.author}
              </span>
              <span className="detail-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
                {manga.artist}
              </span>
              {manga.year && (
                <span className="detail-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {manga.year}
                </span>
              )}
            </div>
            
            <div className="detail-status-row">
              <span className={`detail-status detail-status--${manga.status.toLowerCase()}`}>
                {manga.status}
              </span>
              <span className="detail-chapters-count">{chapters.length} Chapters</span>
            </div>

            <div className="detail-genres">
              {manga.tags.slice(0, 8).map((tag) => (
                <span key={tag} className="detail-genre">{tag}</span>
              ))}
            </div>

            <p className="detail-description">
              {manga.description?.substring(0, 600)}{manga.description && manga.description.length > 600 ? '…' : ''}
            </p>

            {chapters.length > 0 && (
              <Link to={`/read/${chapters[0].id}`} className="detail-read-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                Start Reading
              </Link>
            )}
          </div>
        </div>

        {/* Chapter List */}
        <div className="detail-section">
          <div className="detail-section__header">
            <h2 className="detail-section__title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'middle'}}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Chapters
            </h2>
          </div>

          {chaptersLoading ? (
            <div className="detail-skeleton">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '8px', flex: 1 }} />
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <p className="detail-description">No English chapters available yet.</p>
          ) : (
            <div className="chapter-list">
              {chapters.map((ch) => (
                <Link
                  key={ch.id}
                  to={`/read/${ch.id}`}
                  className="chapter-item"
                >
                  <span className="chapter-item__name">
                    Ch. {ch.chapter} {ch.title ? `- ${ch.title}` : ''}
                  </span>
                  <span className="chapter-item__arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
