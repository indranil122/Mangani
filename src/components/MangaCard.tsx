import { Link } from 'react-router-dom';
import type { MangaItem } from '../services/api';
import './MangaCard.css';

interface MangaCardProps {
  manga: MangaItem;
  index?: number;
}

export default function MangaCard({ manga, index = 0 }: MangaCardProps) {
  return (
    <Link
      to={`/manga/${manga.id}`}
      className="manga-card"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="manga-card__image-wrapper">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="manga-card__image"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YxZjNmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGI4YmEzIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
          }}
        />
        <div className="manga-card__overlay">
          <span className="manga-card__read-btn">Read Now</span>
        </div>
        {manga.status && (
          <span className="manga-card__chapter badge badge-accent">
            {manga.status}
          </span>
        )}
      </div>
      <div className="manga-card__info">
        <h3 className="manga-card__title">{manga.title}</h3>
        <div className="manga-card__meta">
          {manga.year && (
            <span className="manga-card__views">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {manga.year}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
