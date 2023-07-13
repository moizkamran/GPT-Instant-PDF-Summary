import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./Context/AuthContext";
import Login from "./Auth/Login";
import GptFile from "./GptFile";
import Register from "./Auth/Register";import './flairs.css'

function App() {
  return (
    <>
      <AuthContextProvider>
        <Routes>
        <Route path="/gpt" element={<GptFile />} />

        <Route path="/Register" element={<Register />} />

          <Route path="/" element={<Login />} />
        </Routes>
      </AuthContextProvider>
    </>
  );
}

export default App;
