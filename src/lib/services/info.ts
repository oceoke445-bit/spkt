import { db, ensureDbReady } from '@/lib/db';

export interface InfoArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  date: string;
}

function rowToArticle(row: {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  published_at: string;
}): InfoArticle {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    content: row.content,
    date: row.published_at,
  };
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

  return rows.map(rowToArticle);
}

export function getInfoArticle(id: string): InfoArticle | null {
  ensureDbReady();
  const row = db
    .prepare('SELECT id, title, category, description, content, published_at FROM info_articles WHERE id = ?')
    .get(id) as {
      id: string;
      title: string;
      category: string;
      description: string;
      content: string;
      published_at: string;
    } | undefined;
  return row ? rowToArticle(row) : null;
}

export function createInfoArticle(input: {
  title: string;
  category: string;
  description: string;
  content: string;
}): InfoArticle {
  ensureDbReady();
  const id = `ART${Date.now()}`;
  const publishedAt = new Date().toISOString().slice(0, 10);
  db.prepare(
    `INSERT INTO info_articles (id, title, category, description, content, published_at)
     VALUES (@id, @title, @category, @description, @content, @publishedAt)`,
  ).run({ id, ...input, publishedAt });
  return getInfoArticle(id)!;
}

export function updateInfoArticle(
  id: string,
  input: Partial<{ title: string; category: string; description: string; content: string }>,
): InfoArticle | null {
  ensureDbReady();
  const existing = getInfoArticle(id);
  if (!existing) return null;

  const updates: string[] = [];
  const params: Record<string, string> = { id };

  if (input.title !== undefined) {
    updates.push('title = @title');
    params.title = input.title;
  }
  if (input.category !== undefined) {
    updates.push('category = @category');
    params.category = input.category;
  }
  if (input.description !== undefined) {
    updates.push('description = @description');
    params.description = input.description;
  }
  if (input.content !== undefined) {
    updates.push('content = @content');
    params.content = input.content;
  }

  if (updates.length === 0) return existing;
  db.prepare(`UPDATE info_articles SET ${updates.join(', ')} WHERE id = @id`).run(params);
  return getInfoArticle(id);
}

export function deleteInfoArticle(id: string): boolean {
  ensureDbReady();
  const result = db.prepare('DELETE FROM info_articles WHERE id = ?').run(id);
  return result.changes > 0;
}
