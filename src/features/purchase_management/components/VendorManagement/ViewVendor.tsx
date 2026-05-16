import React, { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import { getVendorEntry } from "../../ModuleStateFiles/VendorManagementSlice";
import {
    ChevronRight,
    Building2,
    //   Package,
    Star,
    Mail,
    Phone,
    MapPin,
    //   Hash,
    //   Edit3,
    //   ArrowLeft,
    Globe,
    User,
    Edit,
} from "lucide-react";

const ViewVendor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { vendor } = useAppSelector((state) => state.vendorManagement);

    useEffect(() => {
        if (id) dispatch(getVendorEntry(id));
    }, [id, dispatch]);

    if (!vendor) {
        return <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500 text-sm">Vendor not found</p>
        </div>;
    }

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
                    <span className="text-gray-800 font-bold">
                        Profile: {vendor.vendor_id}
                    </span>
                </div>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            Supplier Profile
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Detailed overview of vendor performance and capabilities
                        </p>
                    </div>
                    <Link
                        to={`/purchase/vendors/edit-vendor/${vendor.id}`}
                        className="outline-none flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#f67317] text-white rounded-xl font-black text-sm shadow-xl shadow-orange-100"
                    >
                        <Edit size={18} /> Modify Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6 h-fit">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Building2 size={120} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                                <Building2 size={14} /> Fixed Context
                            </h3>
                            <div className="space-y-8 relative z-10">
                                <DetailBox label="Company Name" value={vendor.name} />
                                <DetailBox label="Internal ID" value={vendor.vendor_id} />
                                <DetailBox label="Industry Category" value={vendor.category} />
                                <DetailBox
                                    label="Onboarding Date"
                                    value={new Date(vendor.created_at).toLocaleDateString()}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <Globe className="text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Business parameters</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Operational details and performance metrics
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <DataRow
                                    label="Contact Person"
                                    value={vendor.contact_person}
                                    icon={<User size={14} />}
                                />
                                <DataRow
                                    label="Official Email"
                                    value={vendor.email}
                                    icon={<Mail size={14} />}
                                />
                                <DataRow
                                    label="Phone Number"
                                    value={vendor.phone}
                                    icon={<Phone size={14} />}
                                />
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                        <Star size={14} /> Performance Rating
                                    </label>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={20}
                                                className={
                                                    i < vendor.rating
                                                        ? "fill-[#F59E0B] text-[#F59E0B]"
                                                        : "text-slate-200"
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className=" pt-10 border-t border-slate-50">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-4">
                                    <MapPin size={14} /> Supplier Address
                                </label>
                                <p className="bg-slate-50 p-6 rounded-3xl text-sm font-bold text-slate-700 border border-slate-50 leading-relaxed">
                                    {vendor.address}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailBox: React.FC<{ label: string; value: string }> = ({
    label,
    value,
}) => (
    <div className="space-y-1">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            {label}
        </label>
        <div className="text-slate-800 font-black text-base leading-tight">
            {value || "-"}
        </div>
    </div>
);

const DataRow: React.FC<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
}> = ({ label, value, icon }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            {icon} {label}
        </label>
        <div className="bg-slate-50 border border-slate-50 px-6 py-4 rounded-3xl font-black text-slate-800">
            {value}
        </div>
    </div>
);

export default ViewVendor;
