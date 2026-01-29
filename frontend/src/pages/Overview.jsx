import React, { useEffect, useState } from "react";
import { http } from "../api/http.js";

export default function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    http.get("/api/dashboard/overview").then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="card">Chargement…</div>;

  return (
    <div className="grid">
      <div className="card">
        <div className="kpiLabel">Alertes ouvertes</div>
        <div className="kpiValue">{data.kpis.openAlerts}</div>
      </div>

      <div className="card">
        <div className="kpiLabel">Passages aujourd’hui</div>
        <div className="kpiValue">{data.kpis.todayAccess}</div>
      </div>

      <div className="card full">
        <h3>Top zones (aujourd’hui)</h3>
        <table className="table">
          <thead>
            <tr><th>Zone</th><th>Passages</th></tr>
          </thead>
          <tbody>
            {data.topZones.map((z) => (
              <tr key={z.zoneId}>
                <td>{z.zoneName}</td>
                <td>{z.count}</td>
              </tr>
            ))}
            {data.topZones.length === 0 && (
              <tr><td colSpan="2" className="muted">Aucun passage aujourd’hui</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
