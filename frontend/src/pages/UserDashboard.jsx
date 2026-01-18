import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import FaceAttendance from "../components/FaceAttendance";
import UserProfile from "../components/UserProfile";
import { connectSocket } from "../services/socket";
import api from "../services/api";
import "../styles/dashboard.css";

export default function UserDashboard() {
  const [status, setStatus] = useState("Offline");
  const [lastUpdate, setLastUpdate] = useState("--");
  const [user, setUser] = useState(null);
  const [todayExpenses, setTodayExpenses] = useState([]); // State for today's list
  const [expense, setExpense] = useState({
    type: "Travel",
    amount: "",
    note: ""
  });

  // Fetch user profile and today's expenses
  useEffect(() => {
    api.get("/users/me")
      .then(res => setUser(res.data))
      .catch(err => console.error("Error fetching profile", err));
    
    fetchTodayExpenses();
  }, []);

  const fetchTodayExpenses = async () => {
    try {
      const res = await api.get("/expenses/today");
      setTodayExpenses(res.data);
    } catch (err) {
      console.error("Error fetching today's expenses", err);
    }
  };

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;
    setStatus("Online");

    const sendLocation = () => {
      if (user && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            socket.emit("sendLocation", {
              userId: user._id,
              name: user.name,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
            setLastUpdate(new Date().toLocaleTimeString());
          },
          err => console.error("Location error", err),
          { enableHighAccuracy: true }
        );
      }
    };

    sendLocation();
    const interval = setInterval(sendLocation, 10000);
    return () => {
      clearInterval(interval);
      setStatus("Offline");
    };
  }, [user]);

  const submitExpense = async () => {
    if (!expense.amount) return alert("Enter amount");
    try {
      await api.post("/expenses", expense);
      alert("Expense added");
      setExpense({ type: "Travel", amount: "", note: "" });
      fetchTodayExpenses(); // Refresh the today's list immediately
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="User Dashboard" />
        <UserProfile /><br></br>
        
        <div className="cards">
          <div className="card">
            <h4>Status</h4>
            <p className={status === "Online" ? "green" : "red"}>{status}</p>
          </div>
          <div className="card">
            <h4>Last Location Update</h4>
            <p>{lastUpdate}</p>
          </div>
        </div>

        {/* Updated Expense Section */}
        <div className="card mt">
          {/* <h3>Add Expense</h3>
          <div className="expense-inputs">
            <select
              value={expense.type}
              onChange={e => setExpense({ ...expense, type: e.target.value })}
            >
              <option>Travel</option>
              <option>Food</option>
              <option>Tea</option>
              <option>Other</option>
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={expense.amount}
              onChange={e => setExpense({ ...expense, amount: e.target.value })}
            />
            <input
              placeholder="Note"
              value={expense.note}
              onChange={e => setExpense({ ...expense, note: e.target.value })}
            />
            <button onClick={submitExpense}>Save Expense</button>
          </div> */}

          <hr className="mt" />
          
          <h4 className="mt">Today's Expenses</h4>
          <table width="100%" className="user-table mt">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {todayExpenses.length > 0 ? (
                todayExpenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{exp.type}</td>
                    <td>₹{exp.amount}</td>
                    <td>{exp.note || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", color: "#888" }}>No expenses today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card mt">
          <h3>Attendance (Face Scan)</h3>
          <FaceAttendance />
        </div>
      </div>
    </div>
  );
}