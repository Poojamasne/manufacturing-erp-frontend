import { useMemo } from "react";

type InventoryMaterial = {
  id: string;
  name: string;
  available: number;
  reorderLevel: number;
  unit: string;
};

const materials: InventoryMaterial[] = [
  { id: "m1", name: "Steel Sheet", available: 980, reorderLevel: 500, unit: "Kg" },
  { id: "m2", name: "Bolt Pack", available: 18, reorderLevel: 40, unit: "Box" },
  { id: "m3", name: "Industrial Paint Blue", available: 135, reorderLevel: 120, unit: "Litre" },
];

export default function InventoryDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const summary = useMemo(() => {
    return {
      totalMaterials: materials.length,
      lowStock: materials.filter((item) => item.available <= item.reorderLevel).length,
      totalUnits: materials.reduce((sum, item) => sum + item.available, 0),
    };
  }, []);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section
        style={{
          borderRadius: 20,
          padding: 24,
          background: "white",
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ color: "#64748b", fontSize: 13 }}>Welcome back</div>
        <h2 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800 }}>
          {user.fullName || user.name || "Inventory user"}
        </h2>
        <p style={{ margin: "6px 0 0", color: "#475569" }}>
          LocalStorage-first inventory dashboard.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { label: "Total Materials", value: summary.totalMaterials },
          { label: "Low Stock Items", value: summary.lowStock },
          { label: "Stock Units", value: summary.totalUnits },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              borderRadius: 18,
              padding: 20,
              background: "white",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ color: "#64748b", fontSize: 13 }}>{item.label}</div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>{item.value}</div>
          </div>
        ))}
      </section>

      <section
        style={{
          borderRadius: 20,
          padding: 24,
          background: "white",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Low Stock Alerts</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {materials
            .filter((item) => item.available <= item.reorderLevel)
            .map((item) => (
              <div
                key={item.id}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <strong>{item.name}</strong>
                <div style={{ color: "#991b1b", marginTop: 4 }}>
                  Available: {item.available} {item.unit} | Reorder Level: {item.reorderLevel}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
