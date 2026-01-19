import { useState } from "react";
import api from "../services/api"; 
import { connectSocket } from "../services/socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      connectSocket();
      window.location.href = `/${data.role}/dashboard`;
    } catch (err) {
      // FIXED: Removed backend 'res.status' code which crashes the browser
      const msg = err.response?.data?.message || "Connection to server failed";
      setError(msg);
      console.error("Login failed:", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>FOS System</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="admin@test.com" 
              required
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className={`btn-login ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}