import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";

export default function MyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState({
    type: "Travel",
    amount: "",
    note: ""
  });

  // Fetch past expenses for this user
  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses/my-expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const submitExpense = async (e) => {
    e.preventDefault();
    if (!expense.amount) return alert("Please enter an amount");
    
    try {
      await api.post("/expenses", expense);
      alert("Expense submitted successfully!");
      setExpense({ type: "Travel", amount: "", note: "" });
      fetchExpenses(); // Refresh the list
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="My Expenses" />

        {/* ADD EXPENSE FORM */}
        <div className="card mt">
          <h3>Add New Expense</h3>
          <form onSubmit={submitExpense} className="expense-form">
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
              required
            />
            <input
              placeholder="Note (Optional)"
              value={expense.note}
              onChange={e => setExpense({ ...expense, note: e.target.value })}
            />
            <button type="submit" className="btn-primary">Save Expense</button>
          </form>
        </div>

        {/* EXPENSE HISTORY TABLE */}
        <div className="card mt">
          <h3>Expense History</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table width="100%" className="user-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td>{new Date(exp.date).toLocaleDateString()}</td>
                      <td>{exp.type}</td>
                      <td>₹{exp.amount}</td>
                      <td>{exp.note || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>No expenses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}