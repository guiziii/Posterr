import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useUser } from "../../hooks/useUser";
import { useCreatePost } from "../../hooks/useCreatePost";
import { CharCounter } from "../atoms/CharCounter";
import { ApiError } from "../../services/api";

const MAX_LENGTH = 777;

export function CreatePost() {
  const { currentUser } = useUser();
  const [content, setContent] = useState("");
  const createPostMutation = useCreatePost();

  if (!currentUser) return null;

  const remaining = MAX_LENGTH - content.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    createPostMutation.mutate(
      { userId: currentUser.id, content: trimmed },
      { onSuccess: () => setContent("") }
    );
  };

  return (
    <Card variant="outlined" className="mb-4">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <TextField
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            inputProps={{ maxLength: MAX_LENGTH }}
            multiline
            rows={3}
            fullWidth
            disabled={createPostMutation.isPending}
            variant="outlined"
          />
          <div className="flex justify-between items-center mt-2">
            <CharCounter remaining={remaining} />
            <Button
              type="submit"
              variant="contained"
              disabled={createPostMutation.isPending || !content.trim()}
              sx={{ borderRadius: "20px", fontWeight: 600 }}
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
          {createPostMutation.isError && (
            <Alert
              severity={createPostMutation.error instanceof ApiError && createPostMutation.error.status === 429 ? "warning" : "error"}
              className="mt-2"
            >
              {createPostMutation.error instanceof Error
                ? createPostMutation.error.message
                : "Failed to create post."}
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
