import type { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { UserSelector } from "../molecules/UserSelector";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Container maxWidth="sm">
          <Toolbar disableGutters className="flex justify-between">
            <Typography variant="h5" color="primary" fontWeight="bold">
              Posterr
            </Typography>
            <UserSelector />
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="sm" className="py-4">
        {children}
      </Container>
    </Box>
  );
}
