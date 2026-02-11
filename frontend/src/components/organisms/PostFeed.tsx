import { useCallback, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useUser } from "../../hooks/useUser";
import { usePosts } from "../../hooks/usePosts";
import { useRepost } from "../../hooks/useRepost";
import { SearchForm } from "../molecules/SearchForm";
import { SortControls } from "../molecules/SortControls";
import { CreatePost } from "./CreatePost";
import { PostCard } from "./PostCard";
import { ApiError } from "../../services/api";

export function PostFeed() {
  const { currentUser } = useUser();
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [confirmPostId, setConfirmPostId] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = usePosts({ sort, search: search || undefined });

  const repostMutation = useRepost();

  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });

      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const handleRepost = (postId: string) => {
    setConfirmPostId(postId);
  };

  const confirmRepost = () => {
    if (!currentUser || !confirmPostId) return;

    repostMutation.mutate(
      { userId: currentUser.id, postId: confirmPostId },
      { onSuccess: () => setConfirmPostId(null) }
    );
  };

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4">
        <SearchForm
          value={searchInput}
          activeSearch={search}
          onChange={setSearchInput}
          onSubmit={() => setSearch(searchInput.trim())}
          onClear={() => {
            setSearchInput("");
            setSearch("");
          }}
        />
        <SortControls current={sort} onChange={setSort} />
      </div>

      <CreatePost />

      {isError && (
        <Alert severity="error" className="mb-4">
          {error instanceof Error ? error.message : "Failed to load posts."}
        </Alert>
      )}

      {posts.length === 0 && !isLoading && (
        <Typography color="text.secondary" className="text-center py-8">
          No posts found.
        </Typography>
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

      {(isLoading || isFetchingNextPage) && (
        <div className="flex justify-center py-4">
          <CircularProgress size={24} />
        </div>
      )}

      {repostMutation.isError && !confirmPostId && (
        <Alert
          severity={repostMutation.error instanceof ApiError && repostMutation.error.status === 429 ? "warning" : "error"}
          className="mb-4"
          onClose={() => repostMutation.reset()}
        >
          {repostMutation.error instanceof Error
            ? repostMutation.error.message
            : "Failed to repost."}
        </Alert>
      )}

      <Dialog open={confirmPostId !== null} onClose={() => { setConfirmPostId(null); repostMutation.reset(); }}>
        <DialogTitle>Confirm Repost</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to repost this?
          </DialogContentText>
          {repostMutation.isError && (
            <Alert
              severity={repostMutation.error instanceof ApiError && repostMutation.error.status === 429 ? "warning" : "error"}
              sx={{ mt: 2 }}
            >
              {repostMutation.error instanceof Error
                ? repostMutation.error.message
                : "Failed to repost."}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmPostId(null); repostMutation.reset(); }}>Cancel</Button>
          <Button
            onClick={confirmRepost}
            variant="contained"
            disabled={repostMutation.isPending}
          >
            {repostMutation.isPending ? "Reposting..." : "Repost"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
