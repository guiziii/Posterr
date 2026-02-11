import { userSchema, postSchema, paginatedPostsSchema } from "../lib/schemas";
import type { Post, PaginatedResponse, User } from "../lib/schemas";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(url: string, options?: RequestInit): Promise<unknown> {
  const { headers, ...rest } = options ?? {};

  const response = await fetch(`${API_BASE}${url}`, {
    ...rest,
    headers: { "Content-Type": "application/json", ...headers },
  });

  if (!response.ok) {
    if (response.status === 429) {
      const body = await response.json().catch(() => null);
      throw new ApiError(
        body?.error || "Too many requests. Please wait a moment before trying again.",
        429
      );
    }

    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(error.error || `HTTP ${response.status}`, response.status);
  }

  return response.json();
}

export async function getUsers(): Promise<User[]> {
  const data = await request("/users");
  return userSchema.array().parse(data);
}

export async function getPosts(
  page: number,
  limit: number,
  sort: string,
  search?: string
): Promise<PaginatedResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  if (search) params.set("search", search);

  const data = await request(`/posts?${params}`);
  return paginatedPostsSchema.parse(data);
}

export async function createPost(userId: string, content: string): Promise<Post> {
  const data = await request("/posts", {
    method: "POST",
    headers: { "X-User-ID": userId },
    body: JSON.stringify({ content }),
  });
  return postSchema.parse(data);
}

export async function repost(userId: string, postId: string): Promise<Post> {
  const data = await request(`/posts/${postId}/repost`, {
    method: "POST",
    headers: { "X-User-ID": userId },
  });
  return postSchema.parse(data);
}
