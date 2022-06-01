import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";

function logout(setToken) {
  setToken(null);
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
}

export default function ButtonAppBar({ setToken }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            sx={{ mr: 2 }}
          >
            <AccountCircle />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
            {atob(localStorage.getItem("name"))}
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Email Tracker
          </Typography>
          <Button color="inherit" onClick={() => logout(setToken)}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
