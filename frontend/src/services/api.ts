import { PaginatedResponse, Post, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
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
