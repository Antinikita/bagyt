import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useOutletContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Получаем CSRF токен
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        credentials: "include",
      });

      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        navigate("/dashboard");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "300px",
        margin: "100px auto",
        gap: "10px",
      }}
    >
      <h2>Login</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginPage;
