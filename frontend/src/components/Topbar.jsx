export default function Topbar({ title }) {
  const name = localStorage.getItem("name") || "User";
  
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h3>{title}</h3>
      </div>
      <div className="topbar-right">
        <div className="user-info">
          <span>{name}</span>
          <div className="status-indicator pulse"></div>
        </div>
      </div>
    </div>
  );
}