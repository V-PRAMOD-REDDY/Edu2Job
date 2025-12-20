import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth/useAuth";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"; 
import "../styles/Login.css"; 

const LoginPage: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper: Handle Redirect based on Role
  const handleRedirect = (userData: any) => {
    // Check role safely
    const role = userData.role || 'USER'; 
    const isAdmin = role === 'ADMIN' || userData.is_staff;
    
    console.log("Redirecting User:", userData.email, "Role:", role); // Debug Log

    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  // 🟢 FIXED LOGIN LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Get Tokens
      const res = await api.post("/auth/login/", { email, password });
      
      // 2. Save Tokens FIRST
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // 3. 🔥 FETCH USER DETAILS MANUALLY (The Fix)
      // Login response lo user lekapothe, /auth/me nundi techukovali
      let user = res.data.user;
      
      if (!user) {
         console.log("User object missing in login response, fetching /auth/me/...");
         const meRes = await api.get("/auth/me/");
         user = meRes.data;
      }

      // 4. Save to Context & Redirect
      setUser(user);
      handleRedirect(user);

    } catch (err: any) {
      console.error("Login Error Details:", err);
      if (err.response?.data?.detail)
        setError(err.response.data.detail);
      else if (err.response?.status === 401)
        setError("Invalid email or password.");
      else 
        setError("Login failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login Logic
  const handleGoogleSuccess = async (response: any) => {
    try {
      const res = await api.post("/auth/google/", {
        token: response.credential,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // Fetch User Details
      const me = await api.get("/auth/me/");
      setUser(me.data);
      handleRedirect(me.data);

    } catch (err) {
      console.error("Google Login Error:", err);
      setError("Google Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="circle-blur-1"></div>
        <div className="circle-blur-2"></div>
        <div className="brand-content">
          <h1 className="brand-title">Welcome to <span style={{color: '#c7d2fe'}}>Edu2Jobs</span></h1>
          <p className="brand-text">Your gateway to endless career opportunities.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="form-wrapper">
          <div className="form-header">
            <h2 className="form-title">Sign In</h2>
            <p className="form-subtitle">Enter details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="label">Email Address</label>
              <div className="input-wrapper">
                <div className="input-icon"><Mail size={20} /></div>
                <input
                  type="email"
                  className="styled-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <label className="label" style={{marginBottom: 0}}>Password</label>
              </div>
              <div className="input-wrapper">
                <div className="input-icon"><Lock size={20} /></div>
                <input
                  type="password"
                  className="styled-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-msg" style={{color: 'red', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={20} /> Logging in...</> : <><ArrowRight size={18} /> Sign In</>}
            </button>
          </form>

          <div className="divider"><span className="divider-text">Or continue with</span></div>
          
          <div className="google-btn-container" style={{display: 'flex', justifyContent: 'center'}}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google Auth Failed")} width="350" />
          </div>

          <p className="footer-text">
            Don't have an account? <Link to="/register" className="register-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;