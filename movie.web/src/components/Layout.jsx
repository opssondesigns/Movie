// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/global.css"; // (see section 3)

export default function Layout() {
    return (
        <>
            {/* Centered navbar as well */}
            <header className="container">
                <Navbar />
            </header>

            <main className="container">
                <Outlet />
            </main>
        </>
    );
}
