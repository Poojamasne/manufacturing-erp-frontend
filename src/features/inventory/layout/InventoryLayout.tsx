import { NavLink, Outlet } from "react-router-dom";

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: "10px 14px",
  borderRadius: "999px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "14px",
  color: isActive ? "#0f172a" : "#475569",
  background: isActive ? "#dbeafe" : "#f8fafc",
  border: `1px solid ${isActive ? "#93c5fd" : "#e2e8f0"}`,
});

export default function InventoryLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      <header
        style={{
          padding: "24px 28px 12px",
          borderBottom: "1px solid #e2e8f0",
          background: "rgba(255,255,255,0.85)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "#64748b" }}>
              INVENTORY CONTROL
            </div>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800 }}>
              Inventory Management
            </h1>
            <p style={{ margin: "6px 0 0", color: "#475569" }}>
              LocalStorage-first foundation for receipt, storage, issue, and stock tracking.
            </p>
          </div>
          <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <NavLink to="/inventory/dashboard" style={navLinkStyle}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>
      <main style={{ padding: "24px 28px 40px" }}>
        <Outlet />
      </main>
    </div>
  );
}
