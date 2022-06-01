import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./signIn";
import Table from "./table";
import useToken from "./useToken";
import { StyledEngineProvider } from "@mui/material";
import SignUp from "./signUp";

function App() {
  const { token, setToken } = useToken();

  if (localStorage.getItem("timestamp")) {
    const timestamp = localStorage.getItem("timestamp");

    // remove the session from front-end after 25 minutes
    if (
      (new Date().getTime() - new Date(timestamp).getTime()) / 1000 >
      25 * 60
    ) {
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("timestamp");
    }
  }
  if (!token && window.location.href.split("/").pop() !== "sign-up") {
    return <SignIn setToken={setToken} />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <StyledEngineProvider injectFirst>
                <Table setToken={setToken} token={token} />
              </StyledEngineProvider>
            }
          />
          <Route exact path="/sign-up" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
