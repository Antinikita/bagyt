import React from "react";
import api from "../api";

function Dashboard({ user, onLogout }) {
  const handleLogout = async () => {
    try {
      await api.post("/logout");
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[400px] text-center">
        <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
        <p className="text-gray-600 mb-6">{user.email}</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
