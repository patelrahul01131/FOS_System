import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/users")
      .then((res) => {
        // Filter out admins so only accounts with role 'user' are shown
        const onlyUsers = res.data.filter(u => u.role === "user");
        setUsers(onlyUsers);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Field Staff Accounts" />
        <div className="card mt">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3>Registered User Accounts ({users.length})</h3>
          </div>
          
          {loading ? (
            <p>Loading user database...</p>
          ) : users.length === 0 ? (
            <p>No user accounts found in the system.</p>
          ) : (
            <table width="100%" className="user-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Bank Account</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <span className={`status-dot ${user.online ? "online" : "offline"}`}></span>
                      <span style={{ color: user.online ? "#2ecc71" : "#95a5a6" }}>
                        {user.online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td style={{ fontWeight: "bold" }}>{user.name}</td>
                    <td>{user.email}</td>
                    {/* Displaying the Bank Account Number */}
                    <td>{user.bankAccount || "Not Provided"}</td>
                    <td>{user.address || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}