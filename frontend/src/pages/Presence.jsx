import React, { useEffect, useState } from "react";
import { http } from "../api/http.js";

export default function Presence() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await http.get("/api/dashboard/presence");
    setRows(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Personnes présentes (estimé)</h3>
        <button className="btn" onClick={load}>Rafraîchir</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Zone</th>
            <th>Depuis</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td>{r.user ? `${r.user.firstName} ${r.user.lastName}` : "?"}</td>
              <td>{r.user?.email || "?"}</td>
              <td>{r.zone?.name || "?"}</td>
              <td>{new Date(r.lastAt).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="4" className="muted">Personne détectée “IN” actuellement</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
