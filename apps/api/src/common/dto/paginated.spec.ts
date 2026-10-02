import { plainToInstance } from 'class-transformer';
import { paginate } from './paginated';
import { PaginationQueryDto } from './pagination-query.dto';

describe('pagination', () => {
  it('builds meta with rounded-up totalPages', () => {
    expect(paginate(['a', 'b'], 41, { page: 3, limit: 20 }).meta).toEqual({
      page: 3,
      limit: 20,
      total: 41,
      totalPages: 3,
    });
  });

  it('returns zero pages for an empty result', () => {
    expect(paginate([], 0, { page: 1, limit: 20 }).meta.totalPages).toBe(0);
  });

  it('PaginationQueryDto defaults and computes skip', () => {
    const defaults = plainToInstance(PaginationQueryDto, {});
    const third = plainToInstance(PaginationQueryDto, { page: '3', limit: '10' });

    expect([defaults.page, defaults.limit, defaults.skip]).toEqual([1, 20, 0]);
    expect([third.page, third.limit, third.skip]).toEqual([3, 10, 20]);
  });
});
