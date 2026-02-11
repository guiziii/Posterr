import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { Post } from "../../types";
import { RepostLabel } from "../atoms/RepostLabel";
import { PostHeader } from "../molecules/PostHeader";
import { PostActions } from "../molecules/PostActions";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", DATE_FORMAT);
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onRepost: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onRepost }: PostCardProps) {
  const isRepost = post.isRepost && post.originalPost;
  const displayPost = isRepost ? post.originalPost! : post;
  const canRepost = !post.isRepost && post.authorId !== currentUserId;

  return (
    <Card
      variant="outlined"
      className="mb-3"
      sx={
        post.isRepost
          ? { borderLeft: "3px solid", borderLeftColor: "primary.main" }
          : undefined
      }
    >
      <CardContent>
        {isRepost && <RepostLabel username={post.authorUsername} />}

        <PostHeader
          username={displayPost.authorUsername}
          date={formatDate(displayPost.createdAt)}
        />

        <Typography
          variant="body1"
          className="my-2"
          sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {displayPost.content}
        </Typography>

        <PostActions
          repostCount={post.repostCount}
          canRepost={canRepost}
          onRepost={() => onRepost(post.id)}
        />
      </CardContent>
    </Card>
  );
}
