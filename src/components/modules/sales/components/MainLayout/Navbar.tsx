import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";


const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !noteRef.current?.contains(e.target as Node) &&
        !noteRef.current?.contains(e.target as Node)
      ) {
        setOpenNote(false);
        setOpenNote(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Note State
  const [openNote, setOpenNote] = useState(false);
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        setOpenNote(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [])


  const handleSaveNote = () => {
    if (!note.trim()) return;

    const existingNotes = JSON.parse(localStorage.getItem("notes") || "[]");

    const newNote = {
      text: note,
      date: new Date().toISOString(),
    };

    localStorage.setItem("notes", JSON.stringify([newNote, ...existingNotes]));

    setNote("");
    setOpenNote(false);
  };
  return (
    <header className="h-16 sm:h-20 bg-[#f4f7f6] border-b border-[#005d5230] flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-30">
      {/* LEFT */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white text-gray-600 transition-colors"
        >
          <span className="text-xl">☰</span>
        </button>

        <div className="hidden md:block relative w-full max-w-70 lg:max-w-100">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <img src="/icons/search.svg" className="h-4 w-4 opacity-30" alt="" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white rounded-full py-2.5 pl-11 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#005d52]/20 outline-none"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
        <div className="hidden sm:flex items-center gap-1 md:gap-2">

          {/* Note Popup */}
          <div className="relative" ref={noteRef}>

            {/* Button */}
            <button
              onClick={() => setOpenNote((prev) => !prev)}
              title="Add Note"
              className="p-2.5 text-gray-500 outline-none hover:bg-white rounded-full transition-all hover:text-[#005d52] active:scale-90"
            >
              <img src="/icons/note.svg" className="h-5 w-5 opacity-70" alt="" />
            </button>

            {/* Popup */}
            {openNote && (
              <div className="absolute right-0 mt-3 z-50">

                <div className="w-72 bg-white rounded-2xl shadow-xl border border-[#005d52]/10 p-4 animate-[fadeIn_0.2s_ease]">

                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-gray-800">Add Note</p>
                    <button
                      onClick={() => setOpenNote(false)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Input */}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your note..."
                    className="w-full h-24 resize-none border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005d52]/20"
                  />

                  {/* Actions */}
                  <div className="flex justify-end mt-3 gap-2">
                    <button
                      onClick={() => setOpenNote(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1.5 text-xs bg-[#005d52] text-white rounded-lg hover:bg-[#004940]"
                    >
                      Save
                    </button>
                    <Link to="/sales/notes" className="px-3 py-1.5 text-xs bg-[#005d52] text-white rounded-lg hover:bg-[#004940]">
                      View All
                    </Link>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
        {/* Notification */}
        <button className="relative p-2.5 text-gray-500 hover:bg-white rounded-full transition-colors active:scale-90 outline-none">
          <img src="/icons/Bell.svg" className="h-5 w-5 sm:h-6 sm:w-6 opacity-70" alt="" />
          <span className="absolute top-2 right-2 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-[#e63946] text-[8px] sm:text-[9px] text-white rounded-full flex items-center justify-center border-2 border-[#f4f7f6] font-bold">
            3
          </span>
        </button>
        <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1"></div>
        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-white shadow-sm rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-[#005d52]">
            RJ
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-gray-800">Rahul Jagtap</p>
            <p className="text-[10px] text-gray-400 uppercase">Sales Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;