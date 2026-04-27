import { useEffect, useState } from "react";

interface Note {
  text: string;
  date: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  // Load notes
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notes") || "[]");
    setNotes(stored);
  }, []);

  // Delete note
  const deleteNote = (index: number) => {
    const updated = notes.filter((_, i) => i !== index);
    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#f4f7f6] min-h-screen">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Notes
        </h1>
        <span className="text-xs text-gray-400">
          {notes.length} Notes
        </span>
      </div>

      {/* Empty State */}
      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm">No notes available</p>
        </div>
      ) : (
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {notes.map((note, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              
              {/* Top */}
              <div className="flex justify-between items-start mb-3">
                
                {/* Date */}
                <p className="text-[10px] text-gray-400 font-semibold">
                  {new Date(note.date).toLocaleString()}
                </p>

                {/* Delete */}
                <button
                  onClick={() => deleteNote(index)}
                  className="text-gray-300 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {note.text}
              </p>

              {/* Bottom Accent */}
              <div className="mt-4 h-1 w-10 bg-[#F59E0B] rounded-full"></div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default NotesPage;