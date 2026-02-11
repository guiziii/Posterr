import Typography from "@mui/material/Typography";

interface PostHeaderProps {
  username: string;
  date: string;
}

export function PostHeader({ username, date }: PostHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-1">
      <Typography variant="subtitle2" fontWeight={600}>
        @{username}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {date}
      </Typography>
    </div>
  );
}
