import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./App.css"

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <Outlet context={{ user, setUser, handleLogout }} />
    </div>
  );
}

export default App;
