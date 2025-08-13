import React, { useState } from "react";
import { registerUser } from "../services/movieService";
import { Link } from "react-router-dom";
import "../styles/Register.css";

export function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            await registerUser({ fullName, email, password });
            setMessage("✅ Registration successful! You can now log in.");
            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            setMessage("❌ Error: " + error.message);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <div className="logo">Movie Hub</div>
                <h2>Create account</h2>

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Your name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group password-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                        <p className="note">Passwords must be at least 8 characters.</p>
                    </div>

                    <div className="form-group password-group">
                        <label>Re-enter password</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">
                        Create your Movie Hub account
                    </button>
                </form>

                {message && <p className="message">{message}</p>}

                <hr />

                <p className="signin-text">
                    Already have an account?
                    <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
