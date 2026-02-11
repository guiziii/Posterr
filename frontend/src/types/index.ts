export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface OriginalPost {
  id: string;
  content: string;
  createdAt: string;
  authorUsername: string;
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  authorUsername: string;
  authorId: string;
  isRepost: boolean;
  originalPost: OriginalPost | null;
  repostCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  hasMore: boolean;
}
