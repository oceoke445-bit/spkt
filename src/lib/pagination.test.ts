import { describe, it, expect } from 'vitest';
import { parsePagination, buildPaginatedResult } from '@/lib/pagination';

describe('pagination', () => {
  it('parses page and limit from search params', () => {
    const params = new URLSearchParams('page=2&limit=10');
    const result = parsePagination(params);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(10);
  });

  it('clamps limit to max', () => {
    const params = new URLSearchParams('limit=500');
    const result = parsePagination(params);
    expect(result.limit).toBe(100);
  });

  it('builds paginated result metadata', () => {
    const result = buildPaginatedResult(['a', 'b'], 25, 2, 10);
    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
    expect(result.page).toBe(2);
  });
});
