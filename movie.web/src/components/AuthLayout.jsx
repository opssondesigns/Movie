import { Outlet } from "react-router-dom";
import "../styles/global.css";

export default function AuthLayout() {
    return (
        <main className="container" style={{ paddingTop: 24 }}>
            <Outlet />
        </main>
    );
}
