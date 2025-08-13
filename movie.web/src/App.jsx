﻿// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import SearchFromHistory from "./components/SearchFromHistory";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<SearchFromHistory />} />
            </Route>
        </Routes>
    );
}
