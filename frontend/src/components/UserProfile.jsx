import { useEffect, useState } from "react";
import api from "../services/api";

export default function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  api.get("/users/me")
    .then(res => setUser(res.data))
    .catch(err => {
      console.error("Profile Fetch Error:", err.response?.status);
      // Optional: Set user to an empty object so it doesn't stay 'null' forever
      setUser({ name: "Guest", email: "Not logged in" }); 
    });
}, []);

  if (!user) return null;

  return (
    <div className="card">
      <h3>User Profile</h3>

      <img
        src={user.profileImage || "https://ui-avatars.com/api/?name=" + user.name}
        alt="profile"
        style={{ borderRadius: "50%", width: "100px" }}
        />

      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Bank:</strong> {user.bankAccount || "-"}</p>
      <p><strong>Address:</strong> {user.address || "-"}</p>
    </div>
  );
}
