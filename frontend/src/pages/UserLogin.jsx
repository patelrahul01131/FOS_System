import { useState } from "react";
import axios from "axios";
import { connectSocket } from "../services/socket";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { data } = await axios.post(
      "http://localhost:5000/api/auth/login",
      { email, password }
    );

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    // 🔥 CONNECT SOCKET AFTER TOKEN IS SAVED
    connectSocket();

    window.location.href = `/${data.role}/dashboard`;
  };

  return (
    <>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </>
  );
}
