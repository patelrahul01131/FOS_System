import { useEffect, useState } from "react";
import api from "../services/api";

export default function ExpenseReport({ category }) {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", amount: "", note: "" });
  const [filters, setFilters] = useState({
    userId: "",
    type: "",
    range: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (category === "user") {
      api.get("/admin/users").then(res => setUsers(res.data.filter(u => u.role === "user")));
    }
    fetchData();
  }, [category, filters]);

  const fetchData = async () => {
    try {
      const res = await api.get("/expenses/report", {
        params: { ...filters, category }
      });
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching expenses", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Admin: Are you sure you want to delete this expense record?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const startEdit = (exp) => {
    setEditingId(exp._id);
    setEditForm({ type: exp.type, amount: exp.amount, note: exp.note });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/expenses/${id}`, editForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Update failed - Only Admin or Owner can modify this");
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div className="glass-card mb-20" style={{ width: "100%", position: 'relative', zIndex: 1 }}>
      <h3 style={{ marginBottom: '15px' }}>
        {category === "user" ? "User Expenses List" : "Office Expenses List"}
      </h3>

      {/* FILTER BAR - Responsive Grid */}
      <div className="filter-grid mb-20">
        {category === "user" && (
          <div className="filter-group">
            <label>User</label>
            <select value={filters.userId} onChange={e => setFilters({ ...filters, userId: e.target.value })}>
              <option value="">All Users</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>Category</label>
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            <option>Travel</option>
            <option>Food</option>
            <option>Tea</option>
            <option>Other</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Timeframe</label>
          <select value={filters.range} onChange={e => setFilters({ ...filters, range: e.target.value })}>
            <option value="">Select Range</option>
            <option value="monthly">This Month</option>
            <option value="halfyear">Last 6 Months</option>
            <option value="yearly">This Year</option>
          </select>
        </div>

        <div className="filter-group">
          <label>From</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        </div>

        <div className="filter-group">
          <label>To</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
      </div>

      {/* RESPONSIVE TABLE CONTAINER */}
      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Date</th>
              {category === "user" && <th>User Name</th>}
              <th>Type</th>
              <th>Note</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map(exp => (
                <tr key={exp._id}>
                  <td data-label="Date">{new Date(exp.date).toLocaleDateString()}</td>
                  {category === "user" && (
                    <td data-label="User Name" className="main-text">
                      {exp.user?.name || "Unknown"}
                    </td>
                  )}

                  {editingId === exp._id ? (
                    <>
                      <td data-label="Type">
                        <select
                          className="edit-input"
                          value={editForm.type}
                          onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                        >
                          <option>Travel</option><option>Food</option><option>Tea</option><option>Other</option>
                        </select>
                      </td>
                      <td data-label="Note">
                        <input
                          className="edit-input"
                          type="text"
                          value={editForm.note}
                          onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                        />
                      </td>
                      <td data-label="Amount" style={{ textAlign: "right" }}>
                        <input
                          className="edit-input"
                          type="number"
                          style={{ width: '80px', textAlign: 'right' }}
                          value={editForm.amount}
                          onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                        />
                      </td>
                      <td data-label="Actions" style={{ textAlign: "center" }}>
                        <div className="flex-gap" style={{ justifyContent: 'center' }}>
                          <button onClick={() => handleUpdate(exp._id)} className="btn-login" style={{ padding: '6px 12px', background: '#2ecc71' }}>Save</button>
                          <button onClick={() => setEditingId(null)} className="btn-outline">Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td data-label="Type">
                        <span className={`badge-pill ${exp.type.toLowerCase() === 'travel' ? 'present' : ''}`} style={{ fontSize: '10px' }}>
                          {exp.type}
                        </span>
                      </td>
                      <td data-label="Note" className="sub-text note-cell">
                        {exp.note || "-"}
                      </td>
                      <td data-label="Amount" style={{ textAlign: "right" }} className="amount-cell">
                        ₹{exp.amount}
                      </td>
                      <td data-label="Actions" style={{ textAlign: "center" }}>
                        <div className="flex-gap" style={{ justifyContent: 'center' }}>
                          <button onClick={() => startEdit(exp)} className="text-btn blue">Edit</button>
                          <button onClick={() => handleDelete(exp._id)} className="text-btn red">Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={category === "user" ? 6 : 5} className="empty-state">
                  No records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr style={{ background: "#f8fafc", fontWeight: "bold" }}>
              <td colSpan={category === "user" ? 4 : 3} style={{ textAlign: "right", padding: "15px" }}>
                Total Amount:
              </td>
              <td style={{ textAlign: "right", padding: "15px", color: "#2ecc71", fontSize: "16px" }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}