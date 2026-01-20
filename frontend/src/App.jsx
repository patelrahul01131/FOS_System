import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import UserList from "./pages/UserList";       
import CreateUser from "./pages/CreateUser"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AttendanceReport from "./pages/AttendanceReport";
import MyExpenses from "./pages/MyExpenses";
import OfficeExpenses from "./pages/OfficeExpenses";
import UserExpenses from "./pages/UserExpenses";
import UserHistory from "./pages/UserHistory";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/user/dashboard" />} />

        {/* LOGIN ROUTES */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/user" element={<UserLogin />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/history"
          element={
            <ProtectedRoute role="admin">
              <UserHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/report" 
          element={
            <ProtectedRoute role="admin">
              <AttendanceReport />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin/create-user"
          element={
            <ProtectedRoute role="admin">
              <CreateUser />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/office-expenses" element={<ProtectedRoute role="admin"><OfficeExpenses /></ProtectedRoute>} />
        <Route path="/admin/user-expenses" element={<ProtectedRoute role="admin"><UserExpenses /></ProtectedRoute>} />

        {/* USER ROUTES */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/user/expenses" element={<ProtectedRoute role="user"><MyExpenses /></ProtectedRoute>} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}