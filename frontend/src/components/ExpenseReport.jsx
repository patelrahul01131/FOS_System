import { useEffect, useState } from "react";
import api from "../services/api";

export default function ExpenseReport({ category }) {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null); // Tracks which row is being edited
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

  // DELETE LOGIC
  const handleDelete = async (id) => {
    if (!window.confirm("Admin: Are you sure you want to delete this expense record?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchData(); // Refresh list
    } catch (err) {
      alert("Delete failed");
    }
  };

  // EDIT LOGIC (START)
  const startEdit = (exp) => {
    setEditingId(exp._id);
    setEditForm({ type: exp.type, amount: exp.amount, note: exp.note });
  };

  // EDIT LOGIC (SAVE)
  const handleUpdate = async (id) => {
    try {
      await api.put(`/expenses/${id}`, editForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div className="card mt" style={{ width: "100%" }}>
      {/* FILTER BAR */}
      <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {category === "user" && (
          <select onChange={e => setFilters({...filters, userId: e.target.value})}>
            <option value="">All Users</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        )}
        
        <select onChange={e => setFilters({...filters, type: e.target.value})}>
          <option value="">All Types</option>
          <option>Travel</option><option>Food</option><option>Tea</option><option>Other</option>
        </select>

        <select onChange={e => setFilters({...filters, range: e.target.value})}>
          <option value="">Select Range</option>
          <option value="monthly">This Month</option>
          <option value="halfyear">Last 6 Months</option>
          <option value="yearly">This Year</option>
        </select>

        <input type="date" onChange={e => setFilters({...filters, startDate: e.target.value})} />
        <input type="date" onChange={e => setFilters({...filters, endDate: e.target.value})} />
      </div>

      {/* FULL WIDTH TABLE */}
      <table className="user-table" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                {category === "user" && <td>{exp.user?.name || "Unknown"}</td>}
                
                {/* EDITABLE FIELDS */}
                {editingId === exp._id ? (
                  <>
                    <td>
                      <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                        <option>Travel</option><option>Food</option><option>Tea</option><option>Other</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <input type="number" style={{ width: '80px' }} value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button onClick={() => handleUpdate(exp._id)} style={{ color: 'green', cursor: 'pointer', marginRight: '10px' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ color: 'gray', cursor: 'pointer' }}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{exp.type}</td>
                    <td>{exp.note || "-"}</td>
                    <td style={{ textAlign: "right" }}>₹{exp.amount}</td>
                    <td style={{ textAlign: "center" }}>
                      <button onClick={() => startEdit(exp)} style={{ border: 'none', background: 'none', color: '#3498db', cursor: 'pointer', marginRight: '10px' }}>Edit</button>
                      <button onClick={() => handleDelete(exp._id)} style={{ border: 'none', background: 'none', color: '#e74c3c', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={category === "user" ? 6 : 5} style={{ textAlign: "center", padding: "20px" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
        
        <tfoot>
          <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold", borderTop: "2px solid #dee2e6" }}>
            <td colSpan={category === "user" ? 4 : 3} style={{ textAlign: "right", padding: "12px" }}>
              Total Amount:
            </td>
            <td style={{ textAlign: "right", padding: "12px", color: "#2ecc71" }}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}