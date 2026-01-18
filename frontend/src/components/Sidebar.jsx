import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  
  // 1. Get the role directly from LocalStorage (since Login.jsx saves it there)
  const role = localStorage.getItem("role"); 
  
  // 2. Check if the string matches "admin"
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    // Redirect to the correct login page based on who is logging out
    navigate(isAdmin ? "/admin" : "/user");
  };

  return (
    <div className="sidebar">
      <h2>Satnam Sales</h2>

      <nav>
        {/* --- ADMIN LINKS --- */}
        {isAdmin && (
          <>
            <Link to="/admin/dashboard">Admin Dashboard</Link>
            <Link to="/admin/report">Attendance Report</Link>
            <Link to="/admin/users">Manage Users</Link>
            <Link to="/admin/create-user">Add New User</Link>
            <Link to="/admin/office-expenses">Office Expenses</Link>
            <Link to="/admin/user-expenses">User Expenses List</Link>
          </>
        )}

        {/* --- USER LINKS --- */}
        {role === "user" && (
          <>
            <Link to="/user/dashboard">User Dashboard</Link>
            <Link to="/user/expenses">My Expenses</Link>
          </>
        )}

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
    </div>
  );
}