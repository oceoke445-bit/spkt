import { db, ensureDbReady } from '@/lib/db';

export interface InfoArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  date: string;
}

export function listInfoArticles(): InfoArticle[] {
  ensureDbReady();
  const rows = db
    .prepare(
      `SELECT id, title, category, description, content, published_at
       FROM info_articles ORDER BY published_at DESC`,
    )
    .all() as Array<{
      id: string;
      title: string;
      category: string;
      description: string;
      content: string;
      published_at: string;
    }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    content: row.content,
    date: row.published_at,
  }));
}
