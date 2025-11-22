import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext"; // путь к твоему context

export default function Header() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    fetch("http://localhost:8000/api/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setUser(null); // очищаем пользователя
      navigate("/"); // редирект на логин
    });
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#f0f0f0",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0 }}>Complaint Manager</h2>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {user ? <span>{user.name}</span> : <button onClick={() => navigate("/login")}>Login</button>}
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    </header>
  );
}
