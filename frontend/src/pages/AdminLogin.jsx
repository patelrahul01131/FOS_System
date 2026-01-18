import { useState } from "react";
import axios from "axios";
import { connectSocket } from "../services/socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      // 1. Save Token
      localStorage.setItem("token", data.token);
      
      // 2. Save User Object (contains name, role, etc.)
      // We stringify it because localStorage only stores strings
      localStorage.setItem("user", JSON.stringify(data.user || { role: data.role }));

      // 🔥 CONNECT SOCKET AFTER TOKEN IS SAVED
      connectSocket();

      // Redirect based on role
      window.location.href = `/${data.role}/dashboard`;
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}