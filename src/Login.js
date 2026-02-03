import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        username,
        password,
      });

      // Save access token in localStorage
      localStorage.setItem("token", res.data.access);

      // Call parent function to update login state
      onLogin();
    } catch {
      setError("❌ Invalid username or password");
    }
  };

  return (
    <div style={background}>
      <div style={card}>
        <h2 style={title}>🔐 Login</h2>

        <input
          style={input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button style={button} onClick={handleLogin}>
          Login
        </button>

        {error && <p style={errorStyle}>{error}</p>}
      </div>
    </div>
  );
}

// ✅ Styles
const background = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #6c5ce7, #0984e3)",
  fontFamily: "Arial, sans-serif",
};

const card = {
  background: "#fff",
  padding: "40px 30px",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  width: "350px",
  textAlign: "center",
};

const title = {
  marginBottom: "25px",
  color: "#333",
};

const input = {
  width: "80%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const button = {
  width: "85%",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  background: "#6c5ce7",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
};

const errorStyle = {
  color: "red",
  marginTop: "15px",
  fontWeight: "bold",
};

export default Login;
