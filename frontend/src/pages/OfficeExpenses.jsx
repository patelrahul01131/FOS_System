import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
// Add the import below (adjust the path if your file is in a different folder)
import ExpenseReport from "../components/ExpenseReport"; 

export default function OfficeExpenses() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar title="Office Expenses" />
        {/* Now this will work because it is imported above */}
        <ExpenseReport category="office" />
      </div>
    </div>
  );
}