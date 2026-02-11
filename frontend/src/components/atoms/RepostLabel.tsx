import Typography from "@mui/material/Typography";

interface RepostLabelProps {
  username: string;
}

export function RepostLabel({ username }: RepostLabelProps) {
  return (
    <Typography variant="caption" color="primary" className="mb-1">
      Reposted by @{username}
    </Typography>
  );
}
