import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import api from "../api";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react"; // Added 'User' icon
import "../styles/Login.css"; // Reuse the same CSS file

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/register/", {
        email,
        username,
        password,
      });

      console.log("Registration Success:", response.data);
      navigate("/login");
    } catch (err: any) {
      console.error("Register error:", err);

      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data;
        // Logic kept same as your original code
        setError(
          typeof data === "string" ? data : JSON.stringify(data, null, 2)
        );
      } else {
        setError("Unable to register. Server error.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      
      {/* LEFT SIDE: Branding (Same as Login) */}
      <div className="login-left">
        <div className="circle-blur-1"></div>
        <div className="circle-blur-2"></div>
        
        <div className="brand-content">
          <h1 className="brand-title">Join <span style={{color: '#c7d2fe'}}>Edu2Jobs</span></h1>
          <p className="brand-text">
            Start your journey today. Create an account to explore thousands of job opportunities and learning paths.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="login-right">
        <div className="form-wrapper">
          <div className="form-header">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div className="input-group">
              <label className="label">Email Address</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Mail size={20} />
                </div>
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

            {/* Username Input (New Field) */}
            <div className="input-group">
              <label className="label">Username</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  className="styled-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label className="label">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  className="styled-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="error-msg" style={{ whiteSpace: "pre-wrap" }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                <>
                  Register <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="footer-text">
            Already have an account?{" "}
            <Link to="/login" className="register-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;