import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { queryClient } from "./lib/queryClient";
import theme from "./theme";
import { UserProvider } from "./contexts/UserContext";
import { useUser } from "./hooks/useUser";
import { MainLayout } from "./components/templates/MainLayout";
import { HomePage } from "./pages/HomePage";

function AppContent() {
  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
        <Typography className="ml-3" variant="h6">
          Loading Posterr...
        </Typography>
      </Box>
    );
  }

  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
