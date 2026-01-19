import { useState } from "react";
import api from "../services/api"; // Use the central API instance
import { connectSocket } from "../services/socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      // Points to Vercel/Render URL automatically
      const { data } = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      connectSocket();

      window.location.href = `/${data.role}/dashboard`;
    } catch (error) {
    // This will print the EXACT error in your Render Logs
    console.error("CRASH IN LOGIN CONTROLLER:", error.message); 
    res.status(500).json({ message: error.message });
  }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button className="btn-primary" onClick={login}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}