import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

function UserPage() {
  const navigate = useNavigate();
  const { user, handleLogout } = useOutletContext();

  if (!user) return <h2>You are not logged in</h2>;

  return (
    <div className="user-page">
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>

      <button onClick={() => navigate("/panel")}>Go to Control Panel</button>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default UserPage;
