import { UserProvider, useUser } from "./contexts/UserContext";
import { UserSelector } from "./components/UserSelector";
import { PostFeed } from "./components/PostFeed";
import "./App.css";

function AppContent() {
  const { loading } = useUser();

  if (loading) {
    return <div className="loading-screen">Loading Posterr...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Posterr</h1>
        <UserSelector />
      </header>
      <main className="app-main">
        <PostFeed />
      </main>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
