import Typography from "@mui/material/Typography";

interface CharCounterProps {
  remaining: number;
  warningThreshold?: number;
}

export function CharCounter({ remaining, warningThreshold = 50 }: CharCounterProps) {
  return (
    <Typography
      variant="caption"
      color={remaining < warningThreshold ? "error" : "text.secondary"}
    >
      {remaining} characters remaining
    </Typography>
  );
}
