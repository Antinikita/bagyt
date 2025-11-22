import React from "react";
import { useOutletContext } from "react-router-dom";

function ControlPanel() {
  const { handleLogout } = useOutletContext();

  return (
    <div>
      <h2>Control Panel</h2>
      <p>Here will be admin/manage features.</p>

      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
}

export default ControlPanel;
