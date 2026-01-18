import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ExpenseReport from "../components/ExpenseReport"; // <--- Add this

export default function UserExpenses() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="User Expenses List" />
        <ExpenseReport category="user" />
      </div>
    </div>
  );
}