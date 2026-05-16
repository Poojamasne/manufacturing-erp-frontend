import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/store/hook";
import {
    getGRNEntry,
    updateGRNSuccess,
} from "../../ModuleStateFiles/GoodsReceiptSlice";
import {
    ChevronRight,
    Package,
    Hash,
    Info,
    Calendar,
    Save,
 
    Truck,
    MapPin,
} from "lucide-react";
import Swal from "sweetalert2";

const EditGRN: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { grn } = useAppSelector((state) => state.goodsReceipts);

    const [formData, setFormData] = useState({
        quantity_received: 0,
        batch_number: "",
        warehouse_location: "",
        received_date: "",
    });

    useEffect(() => {
        if (id) dispatch(getGRNEntry(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (grn) {
            setFormData({
                quantity_received: grn.quantity_received,
                batch_number: grn.batch_number,
                warehouse_location: grn.warehouse_location || "",
                received_date: grn.received_date,
            });
        }
    }, [grn]);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!grn) return;

        const payload = { ...grn, ...formData };
        dispatch(updateGRNSuccess(payload)); // Using the reducer from slice

        Swal.fire({
            icon: "success",
            title: "GRN Updated",
            text: "Material receipt details have been modified.",
            confirmButtonColor: "#F59E0B",
        });
        navigate("/purchase/goods-receipts");
    };

    if (!grn)
        return (
            <div className="p-20 text-center font-bold text-slate-400">
                Loading Inward Data...
            </div>
        );

    return (
        <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 pb-24 font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <button
                        onClick={() => navigate("/purchase/goods-receipts")}
                        className="outline-none hover:text-[#F59E0B] font-medium transition-colors"
                    >
                        Goods Receipts
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-bold tracking-tight">
                        Edit: {grn.grn_id}
                    </span>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
                    Modify Inward Log
                </h1>

                <form
                    onSubmit={handleUpdate}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Left Column: Fixed Context */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative h-fit overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Truck size={100} />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-8 flex items-center gap-2">
                                <Truck size={14} /> Fixed Reference
                            </h3>
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Supplier
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        {grn.supplier_name}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        PO Reference
                                    </label>
                                    <p className="text-slate-800 font-black text-base">
                                        {grn.po_ref}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                        Material
                                    </label>
                                    <p className="text-slate-800 font-black text-base leading-tight">
                                        {grn.material_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editable Logistics */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm animate-in fade-in">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-6 mb-10">
                                <div className="p-3 bg-orange-50 rounded-2xl">
                                    <Info className="text-[#F59E0B]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Receipt Parameters</h3>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Update physical inward counts and storage location
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <Package size={14} /> Quantity Received
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.quantity_received}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                quantity_received: Number(e.target.value),
                                            })
                                        }
                                        className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-black text-slate-800 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <Hash size={14} /> Batch / Lot Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.batch_number}
                                        onChange={(e) =>
                                            setFormData({ ...formData, batch_number: e.target.value })
                                        }
                                        className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <MapPin size={14} /> Warehouse Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.warehouse_location}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                warehouse_location: e.target.value,
                                            })
                                        }
                                        className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5">
                                        <Calendar size={14} /> Receipt Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.received_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                received_date: e.target.value,
                                            })
                                        }
                                        className="outline-none w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-3xl font-bold text-slate-700 focus:ring-4 focus:ring-amber-500/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-3 h-3 rounded-full ${grn.qc_status === "Approved" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
                                    ></div>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                                        QC State: {grn.qc_status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate("/purchase/goods-receipts")}
                                    className="outline-none text-sm px-4 py-2 font-bold text-slate-400 hover:text-red-500 border rounded-xl transition-all flex items-center gap-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="outline-none bg-[#F59E0B] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#f67317] transition-all flex items-center gap-2 shadow-xl shadow-orange-100"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGRN;
