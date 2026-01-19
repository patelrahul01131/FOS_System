import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role"); 
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate(isAdmin ? "/admin" : "/user");
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h2>Satnam Sales</h2>
        <span className="role-badge">{role}</span>
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          <>
            <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>📊 Dashboard</Link>
            <Link to="/admin/report" className={isActive("/admin/report")}>📝 Attendance</Link>
            <Link to="/admin/users" className={isActive("/admin/users")}>👥 Manage Users</Link>
            <Link to="/admin/create-user" className={isActive("/admin/create-user")}>➕ Add User</Link>
            <Link to="/admin/office-expenses" className={isActive("/admin/office-expenses")}>🏢 Office Exp.</Link>
            <Link to="/admin/user-expenses" className={isActive("/admin/user-expenses")}>💰 User Exp.</Link>
          </>
        ) : (
          <>
            <Link to="/user/dashboard" className={isActive("/user/dashboard")}>🏠 Dashboard</Link>
            <Link to="/user/expenses" className={isActive("/user/expenses")}>💸 My Expenses</Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </div>
  );
}