import { z } from "zod";

export const MAX_POST_LENGTH = 777;

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post cannot be empty.")
    .max(MAX_POST_LENGTH, `Post cannot exceed ${MAX_POST_LENGTH} characters.`),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const searchSchema = z.object({
  query: z.string().trim().max(200, "Search query is too long."),
});

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  createdAt: z.string(),
});

export const originalPostSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  authorUsername: z.string(),
});

export const postSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  authorUsername: z.string(),
  authorId: z.string(),
  isRepost: z.boolean(),
  originalPost: originalPostSchema.nullable(),
  repostCount: z.number(),
});

export const paginatedPostsSchema = z.object({
  data: z.array(postSchema),
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export type User = z.infer<typeof userSchema>;
export type Post = z.infer<typeof postSchema>;
export type OriginalPost = z.infer<typeof originalPostSchema>;
export type PaginatedResponse = z.infer<typeof paginatedPostsSchema>;
