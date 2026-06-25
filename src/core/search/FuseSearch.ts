import Fuse from 'fuse.js';
import type { SearchItem } from '@/types';

/** Fuse.js 模糊搜索封装 */
class FuseSearch {
  private fuse: Fuse<SearchItem>;
  private items: SearchItem[] = [];

  constructor(items: SearchItem[] = []) {
    this.items = items;
    this.fuse = new Fuse(items, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'keywords', weight: 1 },
      ],
      threshold: 0.4,
      distance: 50,
      includeScore: true,
      minMatchCharLength: 1,
    });
  }

  /** 搜索，返回按匹配度排序的结果 */
  search(query: string): SearchItem[] {
    if (!query.trim()) {
      // 空查询返回所有项
      return this.items;
    }
    return this.fuse.search(query).map((r) => r.item);
  }

  /** 更新搜索索引 */
  updateItems(items: SearchItem[]): void {
    this.items = items;
    this.fuse.setCollection(items);
  }
}

export const fuseSearch = new FuseSearch();
export { FuseSearch };
