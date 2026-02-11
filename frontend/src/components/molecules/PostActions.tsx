import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import RepeatIcon from "@mui/icons-material/Repeat";

interface PostActionsProps {
  repostCount: number;
  canRepost: boolean;
  onRepost: () => void;
}

export function PostActions({ repostCount, canRepost, onRepost }: PostActionsProps) {
  return (
    <>
      <Divider className="my-2" />
      <div className="flex justify-between items-center">
        <Typography variant="caption" color="text.secondary">
          {repostCount} reposts
        </Typography>
        {canRepost && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RepeatIcon />}
            onClick={onRepost}
            sx={{ borderRadius: "16px" }}
          >
            Repost
          </Button>
        )}
      </div>
    </>
  );
}
