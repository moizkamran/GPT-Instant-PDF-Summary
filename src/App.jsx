import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./Context/AuthContext";
import Login from "./Auth/Login";
import GptFile from "./GptFile";
import Register from "./Auth/Register";import './flairs.css'
import HomePage from "./HomePage";
import ResearchAccessPage from "./ResearchAccessPage";
import AllPublications from "./AllPublications";

function App() {
  return (
    <>
      <AuthContextProvider>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pages/:id" element={<ResearchAccessPage />} />
        <Route path="/publications" element={<AllPublications />} />
        </Routes>
      </AuthContextProvider>
    </>
  );
}

export default App;
