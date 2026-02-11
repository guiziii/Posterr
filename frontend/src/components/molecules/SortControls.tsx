import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

interface SortControlsProps {
  current: string;
  onChange: (sort: string) => void;
}

export function SortControls({ current, onChange }: SortControlsProps) {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newSort: string | null) => {
    if (newSort !== null) {
      onChange(newSort);
    }
  };

  return (
    <ToggleButtonGroup
      value={current}
      exclusive
      onChange={handleChange}
      size="small"
    >
      <ToggleButton value="latest">Latest</ToggleButton>
      <ToggleButton value="trending">Trending</ToggleButton>
    </ToggleButtonGroup>
  );
}
