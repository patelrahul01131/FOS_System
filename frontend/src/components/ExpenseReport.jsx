import { useEffect, useState } from "react";
import api from "../services/api";

export default function ExpenseReport({ category }) {
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    userId: "", 
    type: "", 
    range: "", 
    startDate: "", 
    endDate: ""
  });

  useEffect(() => {
    // Fetch users for the dropdown (only if it's the user category)
    if (category === "user") {
      api.get("/admin/users").then(res => setUsers(res.data.filter(u => u.role === "user")));
    }
    fetchData();
  }, [category, filters]);

  const fetchData = async () => {
    try {
        // If your api base URL is http://localhost:5000/api
        // This call targets: http://localhost:5000/api/expenses/report
        const res = await api.get("/expenses/report", { 
        params: { ...filters, category } 
        });
        setExpenses(res.data);
    } catch (err) {
        console.error("Error fetching expenses", err);
        // If you still get a 404, try: api.get("/expenses/expenses/report") 
        // to see if your backend router is repeating the name.
    }
    };

  // Calculate total dynamically (React re-calculates this whenever 'expenses' changes)
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
            <th>Expense Type</th>
            <th>Note</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length > 0 ? (
            expenses.map(exp => (
              <tr key={exp._id}>
                <td>{new Date(exp.date).toLocaleDateString()}</td>
                {category === "user" && <td>{exp.user?.name || "Unknown"}</td>}
                <td>{exp.type}</td>
                <td>{exp.note || "-"}</td>
                <td style={{ textAlign: "right" }}>₹{exp.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={category === "user" ? 5 : 4} style={{ textAlign: "center", padding: "20px" }}>
                No records found for the selected filters.
              </td>
            </tr>
          )}
        </tbody>
        
        {/* FOOTER SHOWING TOTAL */}
        <tfoot>
          <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "bold", borderTop: "2px solid #dee2e6" }}>
            <td colSpan={category === "user" ? 4 : 3} style={{ textAlign: "right", padding: "12px" }}>
              Total Amount:
            </td>
            <td style={{ textAlign: "right", padding: "12px", color: "#2ecc71", fontSize: "1.1rem" }}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}