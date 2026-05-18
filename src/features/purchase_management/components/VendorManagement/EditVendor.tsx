import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
    getVendorEntry,
    editVendorEntry,
} from "../../ModuleStateFiles/VendorManagementSlice";
import {
    ChevronRight,
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    Star,
    // Tag,
    Save,
    // X,
    Activity,
    Info,
} from "lucide-react";

const EditVendor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { vendor, loading } = useAppSelector((state) => state.vendorManagement);

    const [formData, setFormData] = useState({
        vendor_id: "",
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        rating: 5,
        status: "Active",
    });

    useEffect(() => {
        if (id) dispatch(getVendorEntry(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (vendor) {
            setFormData({
                vendor_id: vendor?.vendor_id,
                name: vendor?.name,
                contact_person: vendor?.contact_person,
                email: vendor?.email,
                phone: vendor?.phone,
                address: vendor?.address,
                category: vendor?.category,
                rating: vendor?.rating,
                status: vendor?.status,
            });
        }
    }, [vendor]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (id) dispatch(editVendorEntry(id, formData, navigate));
    };

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/vendors")}
                        className="hover:text-[#F59E0B] transition-colors font-medium"
                    >
                        Vendor Management
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold tracking-tight">
                        Edit: {vendor?.vendor_id}
                    </span>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
                    Modify Profile
                </h1>

                <form
                    onSubmit={handleUpdate}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative h-fit">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                                <Activity size={14} /> Fixed Context
                            </h3>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Vendor ID
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        {vendor?.vendor_id}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Member Since
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        {vendor?.created_at ? new Date(vendor.created_at).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <Info className="text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Operational Details</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Update supplier contact and rating parameters
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <EditableField
                                    label="Company Name"
                                    value={formData.name}
                                    onChange={(v) => setFormData({ ...formData, name: v })}
                                    icon={<Building2 size={14} />}
                                />
                                <EditableField
                                    label="Contact Person"
                                    value={formData.contact_person}
                                    onChange={(v) =>
                                        setFormData({ ...formData, contact_person: v })
                                    }
                                    icon={<User size={14} />}
                                />
                                <EditableField
                                    label="Email Address"
                                    value={formData.email}
                                    onChange={(v) => setFormData({ ...formData, email: v })}
                                    icon={<Mail size={14} />}
                                />
                                <EditableField
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(v) => setFormData({ ...formData, phone: v })}
                                    icon={<Phone size={14} />}
                                />
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <MapPin size={14} /> Office Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({ ...formData, address: e.target.value })
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 h-24 resize-none"
                                />
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B] mb-4 block">
                                        Supplier Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.value as any,
                                            })
                                        }
                                        className="w-full bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs outline-none shadow-xl"
                                    >
                                        <option>Active</option>
                                        <option>Under Review</option>
                                        <option>Blacklisted</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
                                        Update Performance Rating
                                    </label>
                                    <div className="flex gap-3 bg-slate-50 py-2 px-4 rounded-xl">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: s })}
                                            >
                                                <Star
                                                    size={20}
                                                    className={
                                                        s <= formData.rating
                                                            ? "outline-none fill-[#F59E0B] text-[#F59E0B]"
                                                            : "outline-none text-slate-200"
                                                    }
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/purchase/vendors")}
                                    className="outline-none px-4 py-2 font-bold text-slate-400 text-sm border rounded-xl hover:text-red-500 transition-all flex items-center gap-2"
                                >
                                     Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="outline-none bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-[#f67317] transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                                >
                                    <Save size={18} /> {loading ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditableField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    icon: React.ReactNode;
}> = ({ label, value, onChange, icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            {icon} {label}
        </label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500"
        />
    </div>
);

export default EditVendor;
