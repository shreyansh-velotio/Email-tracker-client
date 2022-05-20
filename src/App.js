import React from "react";
import "./App.css";
import Table from "./table";
import { StyledEngineProvider } from "@mui/material/styles";

function App() {
  return (
    <div className="App">
      <StyledEngineProvider injectFirst>
        <Table />
      </StyledEngineProvider>
    </div>
  );
}

export default App;
