import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../services/api";
import "../styles/dashboard.css";

export default function MyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); // Stores the ID of expense being edited
  const [expense, setExpense] = useState({
    type: "Travel",
    amount: "",
    note: ""
  });

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

  // Submit Logic (Handles both Create and Update)
  const submitExpense = async (e) => {
    e.preventDefault();
    if (!expense.amount) return alert("Please enter an amount");

    try {
      if (isEditing) {
        // UPDATE EXISTING
        await api.put(`/expenses/${isEditing}`, expense);
        alert("Expense updated!");
      } else {
        // CREATE NEW
        await api.post("/expenses", expense);
        alert("Expense submitted successfully!");
      }
      
      // Reset Form
      setExpense({ type: "Travel", amount: "", note: "" });
      setIsEditing(null);
      fetchExpenses();
    } catch (err) {
      alert("Action failed. Please try again.");
    }
  };

  // DELETE LOGIC
  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // EDIT TRIGGER
  const startEdit = (exp) => {
    setIsEditing(exp._id);
    setExpense({
      type: exp.type,
      amount: exp.amount,
      note: exp.note
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="My Expenses" />

        <div className="dashboard-container">
          {/* FORM CARD */}
          <div className="glass-card mb-20">
            <h3>{isEditing ? "📝 Modify Expense" : "➕ Add New Expense"}</h3>
            <form onSubmit={submitExpense} className="expense-form mt">
              <div className="filter-grid">
                <div className="filter-group">
                  <label>Category</label>
                  <select
                    value={expense.type}
                    onChange={e => setExpense({ ...expense, type: e.target.value })}
                  >
                    <option>Travel</option>
                    <option>Food</option>
                    <option>Tea</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={expense.amount}
                    onChange={e => setExpense({ ...expense, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="filter-group">
                  <label>Note</label>
                  <input
                    placeholder="Details..."
                    value={expense.note}
                    onChange={e => setExpense({ ...expense, note: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt flex-gap">
                <button type="submit" className="btn-primary">
                  {isEditing ? "Update Expense" : "Save Expense"}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn-outline"
                    onClick={() => { setIsEditing(null); setExpense({type: "Travel", amount: "", note: ""}); }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* HISTORY TABLE */}
          <div className="glass-card">
            <h3>Expense History</h3>
            <div className="table-responsive mt">
              {loading ? (
                <p className="empty-state">Loading your records...</p>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length > 0 ? (
                      expenses.map((exp) => (
                        <tr key={exp._id}>
                          <td>{new Date(exp.date).toLocaleDateString()}</td>
                          <td><span className={`type-tag ${exp.type.toLowerCase()}`}>{exp.type}</span></td>
                          <td className="amount-cell">₹{exp.amount}</td>
                          <td className="note-cell">{exp.note || "-"}</td>
                          <td>
                            <div className="flex-gap">
                              <button 
                                className="text-btn blue" 
                                onClick={() => startEdit(exp)}
                              >
                                Edit
                              </button>
                              <button 
                                className="text-btn red" 
                                onClick={() => deleteExpense(exp._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-state">No expenses recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}