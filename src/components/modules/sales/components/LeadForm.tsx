import React, { useState, useEffect } from "react";


/* ✅ TYPES */

interface FormData {
  companyName: string;
  contactPerson: string;
  designation: string;
  phoneNumber: string;
  email: string;
  gstNumber: string;
  city: string;
  state: string;
  leadSource: string;
  priority: string;
  expectedDecisionDate: string;
  followUpDate: string;
  initialStatus: string;
  address: string;
  notes: string;
}

interface Product {
  id: number;
  product: string;
  variant: string;
  quantity: number;
  unit: string;
  estValue: number;
  assignedTo: string;
}

interface Summary {
  totalQty: number;
  totalValue: number;
}



/* ✅ COMPONENT */

const LeadForm: React.FC = () => {
  const [formData] = useState<FormData>({
    companyName: "",
    contactPerson: "",
    designation: "Owner",
    phoneNumber: "",
    email: "",
    gstNumber: "",
    city: "",
    state: "",
    leadSource: "",
    priority: "",
    expectedDecisionDate: "",
    followUpDate: "",
    initialStatus: "",
    address:
      "Vasukamal Express - 2nd Floor, Baner, Pune, Maharashtra 411069",
    notes: "",
  });

  const [products] = useState<Product[]>([
    {
      id: Date.now(),
      product: "",
      variant: "Advance",
      quantity: 1,
      unit: "Unit (approx.)",
      estValue: 7.2,
      assignedTo: "",
    },
  ]);

  const [_summary, setSummary] = useState<Summary>({
    totalQty: 0,
    totalValue: 0,
  });

  /* ✅ CALCULATIONS */
  useEffect(() => {
    const qty = products.reduce((acc, curr) => acc + curr.quantity, 0);
    const val = products.reduce(
      (acc, curr) => acc + curr.quantity * curr.estValue,
      0
    );

    setSummary({
      totalQty: qty,
      totalValue: Number(val.toFixed(1)),
    });
  }, [products]);

  /* ✅ HANDLERS */




  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log("Saving Lead:", { ...formData, products });
    alert("Lead saved successfully!");
  };

  /* ✅ REUSABLE COMPONENTS */



  return (
    <div className="min-h-screen bg-white p-4 md:p-8 max-w-6xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* UI same as your code — no change */}
        <button type="submit">Save Lead</button>
      </form>
    </div>
  );
};

export default LeadForm;