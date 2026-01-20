import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bankAccount: "",
    address: ""
  });

  const fetchUsers = () => {
    setLoading(true);
    api.get("/admin/users")
      .then((res) => {
        const onlyUsers = res.data.filter(u => u.role === "user");
        setUsers(onlyUsers);
      })
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // DELETE USER
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this account?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      alert("User deleted successfully");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  // EDIT LOGIC (START)
  const startEdit = (user) => {
    setEditingId(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      bankAccount: user.bankAccount || "",
      address: user.address || ""
    });
  };

  // EDIT LOGIC (SAVE)
  const handleUpdate = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, editForm);
      setEditingId(null);
      fetchUsers(); // Refresh the list
      alert("User updated successfully");
    } catch (err) {
      alert("Update failed");
    }
  };

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
            <div className="table-responsive">
              <table width="100%" className="user-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Bank Account</th>
                    <th>Address</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      {editingId === user._id ? (
                        <>
                          <td>Editing...</td>
                          <td><input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></td>
                          <td><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></td>
                          <td><input type="text" value={editForm.bankAccount} onChange={e => setEditForm({ ...editForm, bankAccount: e.target.value })} /></td>
                          <td><input type="text" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} /></td>
                          <td style={{ textAlign: "center" }}>
                            <button onClick={() => handleUpdate(user._id)} className="btn-save">Save</button>
                            <button onClick={() => setEditingId(null)} className="btn-cancel">Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <span className={`status-dot ${user.online ? "online" : "offline"}`}></span>
                            <span style={{ color: user.online ? "#2ecc71" : "#95a5a6" }}>
                              {user.online ? "Online" : "Offline"}
                            </span>
                          </td>
                          <td style={{ fontWeight: "bold" }}>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.bankAccount || "Not Provided"}</td>
                          <td>{user.address || "N/A"}</td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => startEdit(user)} 
                                style={{ padding: '5px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(user._id)} 
                                style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}