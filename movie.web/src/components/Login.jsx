import React, { useState } from "react";
import { loginUser } from "../services/movieService";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css"; // reuse same CSS

export function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.token);
            setMessage("✅ Login successful!");

            if (onLoginSuccess) onLoginSuccess();

            // Redirect to home after 500ms for UX feedback
            setTimeout(() => {
                navigate("/");
            }, 500);

        } catch (error) {
            setMessage("❌ Error: " + error.message);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <div className="logo">Movie Hub</div>
                <h2>Sign in</h2>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ paddingRight: "35px" }}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    color: "#666",
                                    fontSize: "14px"
                                }}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">
                        Sign in
                    </button>
                </form>

                {message && <p className="message">{message}</p>}

                <hr />

                <p className="signin-text">
                    New to Movie Hub?{" "}
                    <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    );
}
