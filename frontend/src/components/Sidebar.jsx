import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const role = localStorage.getItem("role"); 
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate(isAdmin ? "/admin" : "/user");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <>
      <button className="hamburger" onClick={toggleSidebar}>
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <button className="close-sidebar-btn" onClick={closeSidebar}>✕</button>
          <h2>Satnam Sales</h2>
          <span className="role-badge">{role}</span>
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard" className={isActive("/admin/dashboard")} onClick={closeSidebar}>📊 Dashboard</Link>
              <Link to="/admin/report" className={isActive("/admin/report")} onClick={closeSidebar}>📝 Attendance</Link>
              <Link to="/admin/users" className={isActive("/admin/users")} onClick={closeSidebar}>👥 Manage Users</Link>
              <Link to="/admin/create-user" className={isActive("/admin/create-user")} onClick={closeSidebar}>➕ Add User</Link>
              <Link to="/admin/office-expenses" className={isActive("/admin/office-expenses")} onClick={closeSidebar}>🏢 Office Exp.</Link>
              <Link to="/admin/user-expenses" className={isActive("/admin/user-expenses")} onClick={closeSidebar}>💰 User Exp.</Link>
              <Link to="/admin/history" className={isActive("/admin/history")} onClick={closeSidebar}>📍 Route History</Link>
            </>
          ) : (
            <>
              <Link to="/user/dashboard" className={isActive("/user/dashboard")} onClick={closeSidebar}>🏠 Dashboard</Link>
              <Link to="/user/expenses" className={isActive("/user/expenses")} onClick={closeSidebar}>💸 My Expenses</Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}