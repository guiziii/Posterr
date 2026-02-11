import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchFormProps {
  value: string;
  activeSearch: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export function SearchForm({ value, activeSearch, onChange, onSubmit, onClear }: SearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <TextField
        size="small"
        fullWidth
        placeholder="Search posts..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="outlined"
      />
      <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
        Search
      </Button>
      {activeSearch && (
        <Button
          type="button"
          variant="outlined"
          onClick={onClear}
          startIcon={<ClearIcon />}
        >
          Clear
        </Button>
      )}
    </form>
  );
}
