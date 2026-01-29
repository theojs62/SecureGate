import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@cesi.fr");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await http.post("/api/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard/overview");
    } catch (e2) {
      setError(e2?.response?.data?.error || "Erreur de connexion");
    }
  };

  return (
    <div className="centerPage">
      <form className="card" onSubmit={submit}>
        <h2>Connexion</h2>

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <div className="error">{error}</div>}

        <button className="btnPrimary" type="submit">Se connecter</button>

      </form>
    </div>
  );
}
