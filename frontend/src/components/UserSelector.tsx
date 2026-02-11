import { useUser } from "../contexts/UserContext";

export function UserSelector() {
  const { users, currentUser, setCurrentUser } = useUser();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find((u) => u.id === e.target.value);
    if (user) setCurrentUser(user);
  };

  if (!currentUser) return null;

  return (
    <div className="user-selector">
      <label htmlFor="user-select">User: </label>
      <select id="user-select" value={currentUser.id} onChange={handleChange}>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
}
