import type { PaginatedResponse, Post, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
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
  return request<User[]>("/users");
}

export async function getPosts(
  page: number,
  limit: number,
  sort: string,
  search?: string
): Promise<PaginatedResponse<Post>> {

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  if (search) params.set("search", search);
  
  return request<PaginatedResponse<Post>>(`/posts?${params}`);
}

export async function createPost(userId: string, content: string): Promise<Post> {
  return request<Post>("/posts", {
    method: "POST",
    headers: { "X-User-ID": userId },
    body: JSON.stringify({ content }),
  });
}

export async function repost(userId: string, postId: string): Promise<Post> {
  return request<Post>(`/posts/${postId}/repost`, {
    method: "POST",
    headers: { "X-User-ID": userId },
  });
}
