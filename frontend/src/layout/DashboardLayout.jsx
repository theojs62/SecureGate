import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import RightSidebar from "./RightSidebar.jsx";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="appShell">
      <main className="mainArea">
        <header className="topBar">
          <div>
            <div className="title">SecureGate</div>
            <div className="subtitle">
              {user ? `${user.firstName} ${user.lastName} — ${user.role}` : ""}
            </div>
          </div>
          <button className="btn" onClick={logout}>Se déconnecter</button>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>

      <RightSidebar />
    </div>
  );
}
