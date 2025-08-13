import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles/global.css";

export default function MainLayout() {
    return (
        <>
            <header className="container"><Navbar /></header>
            <main className="container"><Outlet /></main>
        </>
    );
}
