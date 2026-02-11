import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { createPost } from "../services/api";

const MAX_LENGTH = 777;

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { currentUser } = useUser();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return null;

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
      await createPost(currentUser.id, trimmed);
      setContent("");
      onPostCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX_LENGTH - content.length;

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
