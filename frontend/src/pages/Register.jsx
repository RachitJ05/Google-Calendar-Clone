import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { eventService } from "../services/api";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await eventService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      login(res.token, res.user);

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Registration Failed");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
            <img src="/calendar-svgrepo-com.svg" alt="Calendar" width="60" height="60" />
        </div>

        <h1>Create Account</h1>

        <p className="subtitle">
          Create your Google Calendar account
        </p>

        <form
          className="auth-form"
          onSubmit={handleRegister}
        >

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            className="primary-btn"
            type="submit"
          >
            Create Account
          </button>

        </form>

        <p className="bottom-text">

          Already have an account?

          <Link to="/login">

            Sign In

          </Link>

        </p>

      </div>

    </div>
  );
}