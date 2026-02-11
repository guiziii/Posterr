import { useState, useEffect, useCallback, useRef } from "react";
import { Post } from "../types";
import { getPosts, repost } from "../services/api";
import { useUser } from "../contexts/UserContext";
import { PostCard } from "./PostCard";

const INITIAL_LIMIT = 15;
const LOAD_MORE_LIMIT = 20;

export function PostFeed() {
  const { currentUser } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadPosts = useCallback(
    async (pageNum: number, reset: boolean) => {
      setLoading(true);
      try {
        const limit = pageNum === 1 ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
        const result = await getPosts(pageNum, limit, sort, search || undefined);

        setPosts((prev) => (reset ? result.data : [...prev, ...result.data]));
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    },
    [sort, search]
  );

  useEffect(() => {
    setPage(1);
    loadPosts(1, true);
  }, [sort, search, refreshKey, loadPosts]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage, false);
  }, [loading, hasMore, page, loadPosts]);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      });
      observerRef.current.observe(node);
    },
    [hasMore, loading, loadMore]
  );

  const handleRepost = async (postId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Are you sure you want to repost this?")) return;

    try {
      await repost(currentUser.id, postId);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to repost.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handlePostCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="post-feed">
      <div className="feed-controls">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Search</button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
              }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="sort-controls">
          <button
            className={sort === "latest" ? "active" : ""}
            onClick={() => setSort("latest")}
          >
            Latest
          </button>
          <button
            className={sort === "trending" ? "active" : ""}
            onClick={() => setSort("trending")}
          >
            Trending
          </button>
        </div>
      </div>

      <CreatePostSection onPostCreated={handlePostCreated} />

      {posts.length === 0 && !loading && (
        <p className="empty-message">No posts found.</p>
      )}

      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
        >
          <PostCard
            post={post}
            currentUserId={currentUser?.id ?? ""}
            onRepost={handleRepost}
          />
        </div>
      ))}

      {loading && <p className="loading-message">Loading...</p>}
    </div>
  );
}

function CreatePostSection({ onPostCreated }: { onPostCreated: () => void }) {
  const { currentUser } = useUser();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return null;

  const MAX_LENGTH = 777;
  const remaining = MAX_LENGTH - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Post content cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      const { createPost } = await import("../services/api");
      await createPost(currentUser.id, trimmed);
      setContent("");
      onPostCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        disabled={submitting}
      />
      <div className="create-post-footer">
        <span className={`char-count ${remaining < 50 ? "warning" : ""}`}>
          {remaining} characters remaining
        </span>
        <button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
}
