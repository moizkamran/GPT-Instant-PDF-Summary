import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./Context/AuthContext";
import Login from "./Auth/Login";
import GptFile from "./GptFile";
import Register from "./Auth/Register";import './flairs.css'
import HomePage from "./HomePage";
import ResearchAccessPage from "./ResearchAccessPage";

function App() {
  return (
    <>
      <AuthContextProvider>
        <Routes>
        <Route path="/" element={<HomePage />} />
        // create a dynamic route which takes in a parameter called id
        <Route path="/pages/:id" element={<ResearchAccessPage />} />
        </Routes>
      </AuthContextProvider>
    </>
  );
}

export default App;
