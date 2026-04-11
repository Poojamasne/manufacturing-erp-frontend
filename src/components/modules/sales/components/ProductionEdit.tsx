import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Save,
  Box,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../common/ReduxMainHooks";
import {
  getProduction,
  updateProduction,
  clearSalesErrors,
} from "../ModuleStateFiles/ProductionSlice";
import type { RootState } from "../../../../ApplicationState/Store";

type Stage =
  | "Raw Materials"
  | "Cutting"
  | "Assembly"
  | "Quality Check"
  | "Packaging";

const ProductionEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { production, loading } = useAppSelector(
    (state: RootState) => state.SalesProduction,
  );

  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      dispatch(getProduction(id));
    }
    return () => {
      dispatch(clearSalesErrors());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (production && production.id) {
      setFormData({
        stage: production.stage || "Assembly",
        status: production.status || "In Progress",
        started_at: production.started_at
          ? production.started_at.split("T")[0]
          : "",
        completed_at: production.completed_at
          ? production.completed_at.split("T")[0]
          : "",
        assigned_to: production.assigned_to || "",
        notes: production.notes || "",
      });
    }
  }, [production]);

  const stages: Stage[] = [
    "Raw Materials",
    "Cutting",
    "Assembly",
    "Quality Check",
    "Packaging",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "On Hold":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Delayed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const validateForm = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.stage) newErrors.stage = "Stage is required";
  if (!formData.status) newErrors.status = "Status is required";
  
  // Add date validation
  if (formData.started_at && formData.completed_at) {
    const startDate = new Date(formData.started_at);
    const completedDate = new Date(formData.completed_at);
    
    if (completedDate < startDate) {
      newErrors.completed_at = "Completed date cannot be earlier than start date";
    }
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);

    try {
      const updateData = {
        stage: formData.stage,
        status: formData.status,
        started_at: formData.started_at || null,
        completed_at: formData.completed_at || null,
        assigned_to: formData.assigned_to || null,
        notes: formData.notes || null,
      };

      // Remove .unwrap() and handle the promise directly
      const result = await dispatch(updateProduction(id!, updateData));
      if (result.meta.requestStatus === 'fulfilled') {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setTimeout(() => {
          navigate("/sales/production");
        }, 2000);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
  setFormData((prev: any) => ({ ...prev, [field]: value }));
  
  
  if (errors[field]) {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  }
  
  if (field === 'started_at' || field === 'completed_at') {
    const newFormData = { ...formData, [field]: value };
    if (newFormData.started_at && newFormData.completed_at) {
      const startDate = new Date(newFormData.started_at);
      const completedDate = new Date(newFormData.completed_at);
      
      if (completedDate < startDate) {
        setErrors(prev => ({ ...prev, completed_at: "Completed date cannot be earlier than start date" }));
      } else {
        const newErrors = { ...errors };
        delete newErrors.completed_at;
        setErrors(newErrors);
      }
    }
  }
};

  if (loading && !production?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#005d52]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/sales/production")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Edit Production Job
                </h1>
                <p className="text-xs text-gray-500">
                  {production?.job_id || id}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/sales/production")}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 text-white bg-[#005d52] rounded-lg hover:bg-[#004a41] transition-colors disabled:opacity-50 shadow-lg shadow-teal-900/20"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-green-700 font-medium">
                Production job updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Banner */}
        <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status || production?.status)}`}
              >
                {formData.status || production?.status}
              </div>
              <div className="text-sm text-gray-500">
                Last updated:{" "}
                {production?.updated_at
                  ? new Date(production.updated_at).toLocaleDateString()
                  : "N/A"}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Package size={16} className="text-gray-400" />
                <span>Product: {production?.product_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Box size={16} className="text-gray-400" />
                <span>Order: {production?.order_id || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span>Qty: {production?.quantity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: "details", label: "Job Details", icon: ClipboardList },
              { id: "notes", label: "Notes & Info", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#005d52] border-b-2 border-[#005d52]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Box size={20} className="text-[#005d52]" />
                  Production Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={production?.product_name || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={production?.quantity || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Reference
                    </label>
                    <input
                      type="text"
                      value={production?.order_id || "N/A"}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={production?.customer_name || "N/A"}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Production Stage *
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => updateFormData("stage", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent ${
                        errors.stage ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {stages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                    {errors.stage && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.stage}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateFormData("status", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent ${
                        errors.status ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.status}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.started_at}
                      onChange={(e) =>
                        updateFormData("started_at", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                    />
                  </div>
                  <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Expected Completion Date
  </label>
  <input
    type="date"
    value={formData.completed_at}
    onChange={(e) => updateFormData("completed_at", e.target.value)}
    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent ${
      errors.completed_at ? "border-red-500" : "border-gray-300"
    }`}
  />
  {errors.completed_at && (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle size={12} /> {errors.completed_at}
    </p>
  )}
</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To (User ID)
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_to}
                      onChange={(e) =>
                        updateFormData("assigned_to", e.target.value)
                      }
                      placeholder="Enter user ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To Name
                    </label>
                    <input
                      type="text"
                      value={production?.assigned_to_name || "Unassigned"}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList size={20} className="text-[#005d52]" />
                Production Notes
              </h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                rows={6}
                value={formData.notes || ""}
                onChange={(e) => updateFormData("notes", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005d52] focus:border-transparent"
                placeholder="Add production notes, special instructions, or quality issues..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionEdit;