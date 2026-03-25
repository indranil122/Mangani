import { useEffect, useState } from 'react';
import { fetchTags, fetchMangaByTag, fetchPopularManga, type MangaItem } from '../services/api';
import MangaCard from '../components/MangaCard';
import './Browse.css';

interface Tag {
  id: string;
  name: string;
  group: string;
}

export default function Browse() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [mangaList, setMangaList] = useState<MangaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Fetch tags once
  useEffect(() => {
    fetchTags()
      .then((all) => {
        const genreTags = all.filter((t) => t.group === 'genre' || t.group === 'theme');
        genreTags.sort((a, b) => a.name.localeCompare(b.name));
        setTags(genreTags);
      })
      .catch(console.error);
  }, []);

  // Fetch manga
  useEffect(() => {
    setLoading(true);
    const fn = selectedTag
      ? fetchMangaByTag(selectedTag, limit, page * limit)
      : fetchPopularManga(limit, page * limit);

    fn
      .then((res) => {
        setMangaList(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedTag, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="browse-page page-enter container">
      <div className="browse-header">
        <h1>Browse Manga</h1>
        <p className="browse-desc">Explore by genre and theme</p>
      </div>

      {/* Tag filter pills */}
      <div className="browse-filters">
        <div className="filter-group">
          <span className="filter-label">Genres & Themes</span>
          <div className="filter-options filter-options--wrap">
            <button
              className={`filter-chip ${!selectedTag ? 'filter-chip--active' : ''}`}
              onClick={() => { setSelectedTag(''); setPage(0); }}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={`filter-chip ${selectedTag === tag.id ? 'filter-chip--active' : ''}`}
                onClick={() => { setSelectedTag(tag.id); setPage(0); }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
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
            Previous
          </button>
          <div className="pagination__info">
            {page + 1} / {Math.min(totalPages, 50)}
          </div>
          <button
            className="pagination__btn"
            disabled={page >= totalPages - 1 || page >= 49}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
