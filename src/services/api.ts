const BASE = 'https://api.mangadex.org';

// ── Helper: get cover image URL ──
export function getCoverUrl(mangaId: string, fileName: string, size: 256 | 512 = 256) {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.${size}.jpg`;
}

// ── Helper: extract English title ──
function getTitle(attrs: any): string {
  if (attrs.title?.en) return attrs.title.en;
  const keys = Object.keys(attrs.title || {});
  if (keys.length) return attrs.title[keys[0]];
  const alt = attrs.altTitles?.find((a: any) => a.en);
  return alt?.en || 'Untitled';
}

// ── Types ──
export interface MangaItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  status: string;
  year: number | null;
  tags: string[];
  contentRating: string;
}

export interface MangaDetail extends MangaItem {
  author: string;
  artist: string;
  lastChapter: string;
  lastVolume: string;
  originalLanguage: string;
}

export interface Chapter {
  id: string;
  chapter: string;
  title: string;
  volume: string;
  pages: number;
  publishAt: string;
}

// ── Parse manga from API response ──
function parseManga(item: any): MangaItem {
  const attrs = item.attributes;
  const coverRel = item.relationships?.find((r: any) => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName || '';

  return {
    id: item.id,
    title: getTitle(attrs),
    description: attrs.description?.en || Object.values(attrs.description || {})[0] as string || '',
    coverUrl: coverFile ? getCoverUrl(item.id, coverFile) : '',
    status: attrs.status || 'unknown',
    year: attrs.year,
    tags: attrs.tags?.map((t: any) => t.attributes?.name?.en).filter(Boolean) || [],
    contentRating: attrs.contentRating || '',
  };
}

// ── Fetch popular manga ──
export async function fetchPopularManga(
  limit = 20,
  offset = 0
): Promise<{ data: MangaItem[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    'order[followedCount]': 'desc',
    'includes[]': 'cover_art',
    'contentRating[]': 'safe',
    'hasAvailableChapters': 'true',
  });
  // Add extra content ratings
  params.append('contentRating[]', 'suggestive');

  const res = await fetch(`${BASE}/manga?${params}`);
  if (!res.ok) throw new Error('Failed to fetch manga');
  const json = await res.json();
  return {
    data: json.data.map(parseManga),
    total: json.total,
  };
}

// ── Fetch recently updated manga ──
export async function fetchRecentManga(
  limit = 20,
  offset = 0
): Promise<{ data: MangaItem[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    'order[latestUploadedChapter]': 'desc',
    'includes[]': 'cover_art',
    'contentRating[]': 'safe',
    'hasAvailableChapters': 'true',
  });
  params.append('contentRating[]', 'suggestive');

  const res = await fetch(`${BASE}/manga?${params}`);
  if (!res.ok) throw new Error('Failed to fetch manga');
  const json = await res.json();
  return {
    data: json.data.map(parseManga),
    total: json.total,
  };
}

// ── Fetch manga by tag ──
export async function fetchMangaByTag(
  tagId: string,
  limit = 20,
  offset = 0
): Promise<{ data: MangaItem[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    'includedTags[]': tagId,
    'order[followedCount]': 'desc',
    'includes[]': 'cover_art',
    'contentRating[]': 'safe',
    'hasAvailableChapters': 'true',
  });
  params.append('contentRating[]', 'suggestive');

  const res = await fetch(`${BASE}/manga?${params}`);
  if (!res.ok) throw new Error('Failed to fetch manga');
  const json = await res.json();
  return {
    data: json.data.map(parseManga),
    total: json.total,
  };
}

// ── Search manga ──
export async function searchManga(
  query: string,
  limit = 20,
  offset = 0
): Promise<{ data: MangaItem[]; total: number }> {
  const params = new URLSearchParams({
    title: query,
    limit: String(limit),
    offset: String(offset),
    'includes[]': 'cover_art',
    'contentRating[]': 'safe',
    'order[relevance]': 'desc',
  });
  params.append('contentRating[]', 'suggestive');

  const res = await fetch(`${BASE}/manga?${params}`);
  if (!res.ok) throw new Error('Failed to search manga');
  const json = await res.json();
  return {
    data: json.data.map(parseManga),
    total: json.total,
  };
}

// ── Fetch manga detail ──
export async function fetchMangaDetail(id: string): Promise<MangaDetail> {
  const res = await fetch(`${BASE}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`);
  if (!res.ok) throw new Error('Failed to fetch manga detail');
  const json = await res.json();
  const item = json.data;
  const attrs = item.attributes;
  const base = parseManga(item);

  const author = item.relationships?.find((r: any) => r.type === 'author');
  const artist = item.relationships?.find((r: any) => r.type === 'artist');

  return {
    ...base,
    author: author?.attributes?.name || 'Unknown',
    artist: artist?.attributes?.name || 'Unknown',
    lastChapter: attrs.lastChapter || '',
    lastVolume: attrs.lastVolume || '',
    originalLanguage: attrs.originalLanguage || '',
  };
}

// ── Fetch chapter list ──
export async function fetchChapters(
  mangaId: string,
  limit = 100,
  offset = 0
): Promise<{ data: Chapter[]; total: number }> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    'translatedLanguage[]': 'en',
    'order[chapter]': 'asc',
    'includes[]': 'scanlation_group',
  });

  const res = await fetch(`${BASE}/manga/${mangaId}/feed?${params}`);
  if (!res.ok) throw new Error('Failed to fetch chapters');
  const json = await res.json();

  // De-duplicate by chapter number, keep first
  const seen = new Set<string>();
  const chapters: Chapter[] = [];
  for (const ch of json.data) {
    const num = ch.attributes.chapter || '0';
    if (seen.has(num)) continue;
    seen.add(num);
    chapters.push({
      id: ch.id,
      chapter: num,
      title: ch.attributes.title || '',
      volume: ch.attributes.volume || '',
      pages: ch.attributes.pages || 0,
      publishAt: ch.attributes.publishAt || '',
    });
  }

  return { data: chapters, total: json.total };
}

// ── Fetch chapter pages ──
export async function fetchChapterPages(chapterId: string): Promise<string[]> {
  const res = await fetch(`${BASE}/at-home/server/${chapterId}`);
  if (!res.ok) throw new Error('Failed to fetch chapter pages');
  const json = await res.json();

  const baseUrl = json.baseUrl;
  const hash = json.chapter.hash;
  const pages: string[] = json.chapter.data.map(
    (file: string) => `${baseUrl}/data/${hash}/${file}`
  );
  return pages;
}

// ── Fetch tags ──
export async function fetchTags(): Promise<{ id: string; name: string; group: string }[]> {
  const res = await fetch(`${BASE}/manga/tag`);
  if (!res.ok) throw new Error('Failed to fetch tags');
  const json = await res.json();
  return json.data.map((t: any) => ({
    id: t.id,
    name: t.attributes.name.en || '',
    group: t.attributes.group || '',
  }));
}
