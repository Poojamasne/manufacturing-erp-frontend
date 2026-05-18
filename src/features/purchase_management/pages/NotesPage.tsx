import { Trash2, ExternalLink, Maximize2, X, FileText, Calendar, Link as LinkIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface Note {
    text: string;
    date: string;
    path: string;
}

export default function NotePage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
    const [viewingNote, setViewingNote] = useState<{ note: Note; index: number } | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const fetchNotes = () => {
            const stored = JSON.parse(localStorage.getItem("purchase_notes") || "[]");
            setNotes(stored);
        };
        fetchNotes();
        const interval = setInterval(fetchNotes, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setViewingNote(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setViewingNote(null);
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [viewingNote]);

    const deleteNote = (index: number) => {
        const updated = notes.filter((_, i) => i !== index);
        setNotes(updated);
        localStorage.setItem("purchase_notes", JSON.stringify(updated));
        setSelectedNotes((prev) => prev.filter((i) => i !== index));
        setViewingNote(null);
    };

    const toggleSelect = (index: number) => {
        setSelectedNotes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="p-6 lg:p-10 bg-[#f8fafc] min-h-screen font-sans">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Procurement Notes</h1>
                    <p className="text-slate-500 mt-2 flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                        {notes.length} log entries captured from system activities
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {notes.length > 0 && (
                        <button
                            onClick={() => setSelectedNotes(selectedNotes.length === notes.length ? [] : notes.map((_, i) => i))}
                            className="outline-none px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            {selectedNotes.length === notes.length ? "Deselect All" : "Select All"}
                        </button>
                    )}
                    {selectedNotes.length > 0 && (
                        <button
                            onClick={() => {
                                const updated = notes.filter((_, i) => !selectedNotes.includes(i));
                                setNotes(updated);
                                localStorage.setItem("purchase_notes", JSON.stringify(updated));
                                setSelectedNotes([]);
                            }}
                            className="outline-none flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all shadow-md shadow-red-100"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete {selectedNotes.length}
                        </button>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {notes.length === 0 ? (
                <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white rounded-3xl border border-dashed border-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📝</div>
                    <h2 className="text-xl font-bold text-slate-800">No notes yet</h2>
                    <p className="text-slate-500 mt-2">Notes are automatically fetched when you create purchase notes.</p>
                </div>
            ) : (
                /* Masonry Grid */
                <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {notes.map((note, index) => {
                        const isLong = note.text.length > 220;
                        const isSelected = selectedNotes.includes(index);

                        return (
                            <div
                                key={index}
                                className={`break-inside-avoid group bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl relative ${isSelected ? "border-amber-500 ring-4 ring-amber-50" : "border-slate-200 hover:border-amber-200"
                                    }`}
                            >
                                {/* Card Header */}
                                <div className="p-5 pb-3 flex justify-between items-start">
                                    <div className="flex gap-3 items-start">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelect(index)}
                      className="h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-all relative checked:bg-[#F59E0B] checked:border-[#F59E0B] after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:left-1.25 after:top-px after:w-1 after:h-2 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 outline-none"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">
                                                <LinkIcon className="w-3 h-3" />
                                                {note.path.split('/').pop() || "System"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(note.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteNote(index)}
                                        className="outline-none opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="px-5 pb-5">
                                    <div className="relative overflow-hidden">
                                        <p className={`text-sm text-slate-600 leading-relaxed whitespace-pre-wrap ${isLong ? 'max-h-32 overflow-hidden' : ''}`}>
                                            {note.text}
                                        </p>
                                        {isLong && (
                                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent flex items-end justify-center">
                                                <button
                                                    onClick={() => setViewingNote({ note, index })}
                                                    className="outline-none mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full"
                                                >
                                                    <Maximize2 className="w-3 h-3" /> Read More
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Footer Actions */}
                                {!isLong && (
                                    <div className="px-5 py-3 border-t border-slate-50 flex justify-end gap-2">
                                        {note.path && (
                                            <Link
                                                to={note.path}
                                                className="outline-none p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Go to Source"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full Note Modal */}
            {viewingNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
                    <div ref={modalRef} className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Note Detail</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Source: {viewingNote.note.path}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingNote(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-8 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">                            <p className="text-slate-700 leading-8 text-lg whitespace-pre-wrap">
                            {viewingNote.note.text}
                        </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-3 items-center justify-between">
                            <div className="text-sm text-slate-400">
                                Logged on {new Date(viewingNote.note.date).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => deleteNote(viewingNote.index)}
                                    className="outline-none flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Note
                                </button>
                                {viewingNote.note.path && (
                                    <Link
                                        to={viewingNote.note.path}
                                        className="outline-none flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Go to Source
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

