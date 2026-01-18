import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    bankAccount: "", // Added bankAccount to state
    address: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // formData now includes bankAccount
      await api.post("/admin/create-user", formData);
      alert("User Created Successfully!");
      navigate("/admin/users");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Create New User" />
        <div className="card mt">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe"
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="john@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Initial Password</label>
              <input 
                type="password" 
                required 
                placeholder="******"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            {/* NEW FIELD: BANK ACCOUNT */}
            <div className="form-group">
              <label>Bank Account Number</label>
              <input 
                type="text" 
                placeholder="Enter account number"
                onChange={(e) => setFormData({...formData, bankAccount: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="user">Field User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea 
                placeholder="Street, City, State"
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
              />
            </div>
            <button type="submit" className="btn-primary">Create User</button>
          </form>
        </div>
      </div>
    </div>
  );
}   