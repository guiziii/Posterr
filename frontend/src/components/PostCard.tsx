import { Post } from "../types";

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onRepost: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onRepost }: PostCardProps) {
  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const canRepost =
    !post.isRepost && post.authorId !== currentUserId;

  return (
    <div className={`post-card ${post.isRepost ? "repost" : ""}`}>
      {post.isRepost && post.originalPost && (
        <div className="repost-label">
          Reposted by @{post.authorUsername}
        </div>
      )}

      <div className="post-header">
        <span className="post-author">
          @{post.isRepost && post.originalPost ? post.originalPost.authorUsername : post.authorUsername}
        </span>
        <span className="post-date">
          {post.isRepost && post.originalPost
            ? new Date(post.originalPost.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : date}
        </span>
      </div>

      <p className="post-content">
        {post.isRepost && post.originalPost ? post.originalPost.content : post.content}
      </p>

      <div className="post-actions">
        <span className="repost-count">{post.repostCount} reposts</span>
        {canRepost && (
          <button
            className="repost-btn"
            onClick={() => onRepost(post.id)}
          >
            Repost
          </button>
        )}
      </div>
    </div>
  );
}
