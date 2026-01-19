import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // State to track mobile menu
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate(isAdmin ? "/admin" : "/user");
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false); // Close menu when a link is clicked

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <>
      {/* 1. The Hamburger Button (Only visible on Mobile) */}
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        <div className={`hamburger ${isOpen ? "open" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* 2. The Sidebar */}
      <div className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <h2>Satnam Sales</h2>
          <span className="role-badge">{role}</span>
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard" className={isActive("/admin/dashboard")} onClick={closeMenu}>📊 Dashboard</Link>
              <Link to="/admin/report" className={isActive("/admin/report")} onClick={closeMenu}>📝 Attendance</Link>
              <Link to="/admin/users" className={isActive("/admin/users")} onClick={closeMenu}>👥 Manage Users</Link>
              <Link to="/admin/create-user" className={isActive("/admin/create-user")} onClick={closeMenu}>➕ Add User</Link>
              <Link to="/admin/office-expenses" className={isActive("/admin/office-expenses")} onClick={closeMenu}>🏢 Office Exp.</Link>
              <Link to="/admin/user-expenses" className={isActive("/admin/user-expenses")} onClick={closeMenu}>💰 User Exp.</Link>
            </>
          ) : (
            <>
              <Link to="/user/dashboard" className={isActive("/user/dashboard")} onClick={closeMenu}>🏠 Dashboard</Link>
              <Link to="/user/expenses" className={isActive("/user/expenses")} onClick={closeMenu}>💸 My Expenses</Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* 3. Overlay to close menu when clicking outside (Mobile only) */}
      {isOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}
    </>
  );
}