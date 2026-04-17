import React, { useState } from "react";
import {
    Mail,
    Phone,
    Briefcase,
    Save,
    CheckCircle2,
    X,
    User,
    ShieldCheck,
    ChevronRight,
    Lock,
    ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../common/ReduxMainHooks";
import { createEmployee } from "../ModuleStateFiles/EmployeeSlice"; 

interface EmployeeFormData {
    name: string;
    email: string;
    password: string;
    phone: string;
    designation: string;
    role: "salesperson" | "manager";
    is_active: "0" | "1";
}

const AddSalesEmployee: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    
    const [formData, setFormData] = useState<EmployeeFormData>({
        name: "",
        email: "",
        password: "",
        phone: "",
        designation: "Sales Executive",
        role: "salesperson",
        is_active: "1" 
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
           
            const payload = {
                ...formData,
                is_active: Number(formData.is_active)
            };
            await dispatch(createEmployee(payload, navigate));
        } catch (error) {
            console.error("Failed to add employee:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">

            {/* SUCCESS NOTIFICATION TOAST */}
            {showSuccess && (
                <div className="fixed top-6 right-6 z-100 animate-in slide-in-from-right duration-300">
                    <div className="relative flex items-center gap-4 p-5 rounded-2xl shadow-2xl bg-white border-l-4 border-teal-500 min-w-[320px]">
                        <CheckCircle2 className="text-teal-500" size={20} />
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System</h4>
                            <p className="text-sm font-bold text-slate-700">Executive onboarded successfully.</p>
                        </div>
                        <button type="button" onClick={() => setShowSuccess(false)} className="ml-auto text-slate-300 hover:text-slate-500">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">

                {/* TOP NAVIGATION & HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-1 text-sm font-medium">
                            <button onClick={() => navigate("/sales/employees")} className="hover:text-[#005d52] transition-colors">Employee</button>
                            <ChevronRight size={14} />
                            <span className="text-slate-600 font-bold">New Sales Profile</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add Executive</h1>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button type="button" onClick={() => navigate(-1)} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="employee-form"
                            disabled={isSaving}
                            className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm text-white bg-[#005d52] shadow-lg shadow-teal-900/20 hover:bg-[#004a41] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? "Creating..." : <><Save size={18} /> Save Employee</>}
                        </button>
                    </div>
                </div>

                <form id="employee-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* SECTION 1: CREDENTIALS & IDENTITY */}
                    <div className="bg-white rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                        <SectionHeader icon={<User size={20} />} title="Identity & Login" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormInput
                                label="Full Name"
                                icon={<User size={14} />}
                                placeholder="e.g. Sales Executive Name"
                                value={formData.name}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                                required
                            />
                            <FormInput
                                label="Email Address"
                                type="email"
                                icon={<Mail size={14} />}
                                placeholder="executive@erp.com"
                                value={formData.email}
                                onChange={(val) => setFormData({ ...formData, email: val })}
                                required
                            />
                            <FormInput
                                label="Login Password"
                                type="password"
                                icon={<Lock size={14} />}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(val) => setFormData({ ...formData, password: val })}
                                required
                            />
                        </div>
                    </div>

                    {/* SECTION 2: PROFESSIONAL ASSIGNMENT */}
                    <div className="bg-white rounded-4xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                        <SectionHeader icon={<Briefcase size={20} />} title="Role & Communication" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <FormInput
                                label="Phone Number"
                                icon={<Phone size={14} />}
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={(val) => setFormData({ ...formData, phone: val })}
                                required
                            />
                            <FormInput
                                label="Designation"
                                icon={<Briefcase size={14} />}
                                placeholder="Sales Executive"
                                value={formData.designation}
                                onChange={(val) => setFormData({ ...formData, designation: val })}
                                required
                            />
                            <FormSelect
                                label="System Role"
                                icon={<ShieldCheck size={14} />}
                                options={[
                                    { label: "Sales Person", value: "salesperson" },
                                    { label: "Manager", value: "manager" }
                                ]}
                                value={formData.role}
                                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(val) => setFormData({ ...formData, role: val as any })}
                            />
                            <FormSelect
                                label="Account Status"
                                icon={<ShieldCheck size={14} />}
                                options={[
                                    { label: "Active", value: "1" },
                                    { label: "Inactive", value: "0" }
                                ]}
                                value={formData.is_active}
                                //eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(val) => setFormData({ ...formData, is_active: val as any })}
                            />
                        </div>
                    </div>

                    <div className="bg-[#f1f8f7] rounded-3xl p-6 border-l-8 border-[#005d52] flex items-center gap-4">
                        <ShieldCheck className="text-[#005d52]" size={24} />
                        <p className="text-sm font-bold text-slate-700">
                            The executive will be able to log in immediately using the provided email and password once saved.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-teal-50 text-[#005d52] rounded-xl border border-teal-100 shadow-sm">
            {icon}
        </div>
        <h3 className="font-bold text-xl text-slate-800 tracking-tight">{title}</h3>
    </div>
);

const FormInput: React.FC<{ label: string; icon: React.ReactNode; placeholder?: string; type?: string; value: string; onChange: (val: string) => void; required?: boolean }> = ({ label, icon, placeholder, type = "text", value, onChange, required }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-teal-500/5 focus:border-[#005d52] outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
            />
        </div>
    </div>
);

const FormSelect: React.FC<{ label: string; options: { label: string; value: string }[]; value: string; onChange: (val: string) => void; icon?: React.ReactNode }> = ({ label, options, value, onChange, icon }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl ${icon ? 'pl-11' : 'pl-4'} pr-10 py-3 text-sm font-bold focus:ring-4 focus:ring-teal-500/5 focus:border-[#005d52] outline-none appearance-none cursor-pointer transition-all`}
            >
                {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
    </div>
);

export default AddSalesEmployee;