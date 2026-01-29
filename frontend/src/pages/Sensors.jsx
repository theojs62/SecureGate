import React, { useEffect, useState } from "react";
import { http } from "../api/http.js";

export default function Sensors() {
  const [sensors, setSensors] = useState([]);

  const load = async () => {
    // admin only - si tu es security, tu peux masquer ce menu
    const { data } = await http.get("/api/admin/sensors");
    setSensors(data);
  };

  useEffect(() => { load().catch(() => setSensors([])); }, []);

  return (
    <div className="card">
      <div className="rowBetween">
        <h3>Capteurs</h3>
        <button className="btn" onClick={load}>Rafraîchir</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Zone</th>
            <th>Actif</th>
            <th>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map((s) => (
            <tr key={s._id}>
              <td>{s.serial}</td>
              <td>{s.zoneId?.name || "-"}</td>
              <td className={s.active ? "ok" : "bad"}>{String(s.active)}</td>
              <td>{s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleString() : "-"}</td>
            </tr>
          ))}
          {sensors.length === 0 && (
            <tr><td colSpan="4" className="muted">Aucun capteur (ou rôle non admin)</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
