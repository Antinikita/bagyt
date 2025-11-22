import { useNavigate, useOutletContext } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useOutletContext();

  return (
    <header className="header" style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#eee" }}>
      <h2 className="header-title">Complaint Manager</h2>
      <div
        className="header-user"
        onClick={() => navigate("/user")}
        style={{ cursor: "pointer" }}
      >
        {user?.name}
      </div>
    </header>
  );
}
