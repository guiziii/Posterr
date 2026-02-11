import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useUser } from "../../hooks/useUser";

export function UserSelector() {
  const { users, currentUser, setCurrentUser } = useUser();

  const handleChange = (e: SelectChangeEvent) => {
    const user = users.find((u) => u.id === e.target.value);
    if (user) setCurrentUser(user);
  };

  if (!currentUser) return null;

  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel id="user-select-label">User</InputLabel>
      <Select
        labelId="user-select-label"
        id="user-select"
        value={currentUser.id}
        label="User"
        onChange={handleChange}
      >
        {users.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.username}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
