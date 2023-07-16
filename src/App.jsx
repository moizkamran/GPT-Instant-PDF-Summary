import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./Context/AuthContext";
import Login from "./Auth/Login";
import GptFile from "./GptFile";
import Register from "./Auth/Register";import './flairs.css'
import HomePage from "./HomePage";

function App() {
  return (
    <>
      <AuthContextProvider>
        <Routes>
        <Route path="/gpt" element={<GptFile />} />
        <Route path="/" element={<HomePage />} />

        <Route path="/Register" element={<Register />} />

        </Routes>
      </AuthContextProvider>
    </>
  );
}

export default App;
