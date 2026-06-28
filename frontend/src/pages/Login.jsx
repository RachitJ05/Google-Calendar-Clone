import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { eventService } from "../services/api";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await eventService.login({
        email,
        password,
      });

      login(res.token, res.user);

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Login Failed");
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const res = await eventService.googleLogin({
        credential: response.credential,
      });

      login(res.token, res.user);

      navigate("/");
    } catch (err) {
      alert("Google Login Failed");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
            <img src="/calendar-svgrepo-com.svg" alt="Calendar" width="60" height="60" />
        </div>

        <h1>Google Calendar Clone</h1>

        <p className="subtitle">
          Sign in to continue
        </p>

        <form
          onSubmit={handleEmailLogin}
          className="auth-form"
        >

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="primary-btn"
          >
            Sign In
          </button>

        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login">

          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={()=>alert("Google Login Failed")}
          />

        </div>

        <p className="bottom-text">

          Don't have an account?

          <Link to="/register">

            Register

          </Link>

        </p>

      </div>

    </div>
  );
}