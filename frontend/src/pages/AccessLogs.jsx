import React, { useEffect, useState } from "react";
import { http } from "../api/http.js";

export default function AccessLogs() {
  const [logs, setLogs] = useState([]);

  const load = async () => {
    const { data } = await http.get("/api/dashboard/access-logs?limit=100");
    setLogs(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Historique des accès</h3>
        <button className="btn" onClick={load}>Rafraîchir</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Badge</th>
            <th>Utilisateur</th>
            <th>Zone</th>
            <th>Dir</th>
            <th>Statut</th>
            <th>Raison</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id}>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
              <td>{l.badgeUid}</td>
              <td>{l.userId ? `${l.userId.firstName} ${l.userId.lastName}` : "-"}</td>
              <td>{l.zoneId?.name || "-"}</td>
              <td>{l.direction}</td>
              <td className={l.status === "GRANTED" ? "ok" : "bad"}>{l.status}</td>
              <td>{l.reason}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan="7" className="muted">Aucun log</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
