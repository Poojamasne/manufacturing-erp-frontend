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

  const [openNotif, setOpenNotif] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "New lead assigned to you", time: "2 min ago" },
    { id: 2, text: "Sales target updated", time: "10 min ago" },
    { id: 3, text: "New customer registered", time: "1 hr ago" },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !notifRef.current?.contains(e.target as Node)
      ) {
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDeleteNotif = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };


  const handleRefreshNotif = () => {
    setNotifications([
      { id: 1, text: "New lead assigned to you", time: "Just now" },
      { id: 2, text: "Sales report updated", time: "5 min ago" },
      { id: 3, text: "Inventory alert triggered", time: "15 min ago" },
    ]);
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setOpenNotif((prev) => !prev)}
            className="relative p-2.5 text-gray-500 hover:bg-white rounded-full transition-colors active:scale-90 outline-none"
          >
            <img src="/icons/Bell.svg" className="h-5 w-5 sm:h-6 sm:w-6 opacity-70" alt="" />

            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-[#e63946] text-[8px] text-white rounded-full flex items-center justify-center border-2 border-[#f4f7f6] font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          {/* POPUP */}
          {openNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-[#005d52]/10 z-50 animate-in zoom-in-95 duration-200 overflow-hidden">

              {/* HEADER */}
              <div className="flex justify-between items-center px-4 py-3 bg-[#f4f7f6] border-b border-[#005d52]/10">
                <p className="text-sm font-bold text-[#005d52]">
                  Notifications
                </p>

                <button
                  onClick={handleRefreshNotif}
                  className="text-[13px] font-bold text-[#005d52]  hover:underline"
                >
                  Refresh
                </button>
              </div>

              {/* LIST */}
              <div className="max-h-64 overflow-y-auto">

                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-6">
                    No notifications
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className="group flex justify-between items-start gap-3 px-4 py-3 border-b border-gray-100 hover:bg-[#005d52]/5 transition-all"
                    >
                      {/* TEXT */}
                      <div className="flex gap-2 items-start">
                        <div className="mt-1 h-2 w-2 rounded-full bg-[#00f2ff]" />

                        <div>
                          <p className="text-sm text-gray-700 leading-tight">
                            {item.text}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {item.time}
                          </span>
                        </div>
                      </div>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDeleteNotif(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-center px-4 py-2 bg-[#f4f7f6] border-t border-[#005d52]/10">
                <span className="text-[10px] text-gray-400 uppercase">
                  {notifications.length} Active
                </span>

                <button
                  onClick={() => setNotifications([])}
                  className="text-[10px] text-red-500 font-bold hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
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