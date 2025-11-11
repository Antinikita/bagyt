import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="app-container">
      {!user ? (
        <LoginPage onLogin={setUser} />
      ) : (
        <div className="user-page">
          <h2>Welcome, {user.name}!</h2>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
