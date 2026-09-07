import React, { useState, useEffect, useRef } from "react";
import { Coordinate, WeatherLayer } from "../types";
import { 
  Plus, 
  Trash2, 
  NotebookPen, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  Palette, 
  MapPin, 
  Layers as LayersIcon,
  Download,
  Calendar,
  ChevronDown,
  ArrowLeft,
  Search,
  Clock,
  Edit3,
  Check,
  Eye
} from "lucide-react";

export interface Note {
  id: string;
  title: string;
  content: string; // HTML format
  createdAt: string;
  updatedAt: string;
  timestamp?: number;
  coordinates?: Coordinate;
  weatherLayerId?: string;
}

interface SidebarNotesProps {
  currentCoords: Coordinate;
  activeLayer: WeatherLayer;
  onCoordsChange: (coords: Coordinate) => void;
}

// Helper to extract text snippet from HTML
function stripHtml(html: string): string {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Helper to determine date grouping label
function getNoteDateGroup(note: Note): { key: string; label: string; badgeColor: string } {
  const ts = note.timestamp || new Date(note.updatedAt || note.createdAt).getTime();
  if (!ts || isNaN(ts)) {
    return { key: "earlier", label: "Earlier", badgeColor: "bg-slate-800 text-slate-400 border-slate-700" };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfThisWeek = startOfToday - 6 * 86400000;

  if (ts >= startOfToday) {
    return { key: "today", label: "Today", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
  } else if (ts >= startOfYesterday) {
    return { key: "yesterday", label: "Yesterday", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  } else if (ts >= startOfThisWeek) {
    return { key: "this_week", label: "This Week", badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" };
  } else {
    return { key: "earlier", label: "Earlier", badgeColor: "bg-slate-800 text-slate-400 border-slate-700" };
  }
}

export const SidebarNotes: React.FC<SidebarNotesProps> = ({
  currentCoords,
  activeLayer,
  onCoordsChange,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  // Initially null so editor is not open immediately by default
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState<boolean>(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("meteo_notes");
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed);
        // Do NOT set activeNoteId here so user opens list by default
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    } else {
      // Seed with an initial welcoming note
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " - " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const defaultNote: Note = {
        id: "default-welcome",
        title: "Meteorological Analysis & Journal",
        content: `<div><span style="font-size: 18px; font-weight: bold; color: #3b82f6;">Welcome to Meteo Notes & Journal ⛈️</span></div>
<div><br></div>
<div>Document synoptic trends, forecast anomalies, and field observations directly alongside your interactive maps. All changes save automatically.</div>
<div><br></div>
<div><span style="font-weight: bold; color: #38bdf8;">Key Features:</span></div>
<ul>
  <li><strong>Date Grouping:</strong> Organizes your logs chronologically (Today, Yesterday, This Week, Earlier).</li>
  <li><strong>Insert Map Location:</strong> Click <span style="color: #3b82f6; font-weight: bold;">Insert Location 📍</span> to stamp coordinates into text.</li>
  <li><strong>Insert Active Layer:</strong> Click <span style="color: #10b981; font-weight: bold;">Insert Layer 🗺️</span> to document active weather parameter units.</li>
</ul>`,
        createdAt: formattedDate,
        updatedAt: formattedDate,
        timestamp: Date.now(),
        coordinates: { ...currentCoords },
        weatherLayerId: activeLayer.id
      };
      setNotes([defaultNote]);
      localStorage.setItem("meteo_notes", JSON.stringify([defaultNote]));
    }
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Sync title and body with selection change or switching to edit mode
  useEffect(() => {
    if (isEditing && editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
  }, [activeNoteId, isEditing]);

  // Save notes to localStorage
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("meteo_notes", JSON.stringify(updatedNotes));
  };

  const createNewNote = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " - " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 11),
      title: `Analysis Note ${notes.length + 1}`,
      content: "<div>Start typing your weather report or observations...</div>",
      createdAt: formattedDate,
      updatedAt: formattedDate,
      timestamp: Date.now(),
      coordinates: { ...currentCoords },
      weatherLayerId: activeLayer.id
    };
    const updated = [newNote, ...notes];
    saveNotesToStorage(updated);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this note?")) return;
    const updated = notes.filter(n => n.id !== id);
    saveNotesToStorage(updated);
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const handleTitleChange = (val: string) => {
    if (!activeNoteId) return;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " - " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, title: val, updatedAt: formattedDate, timestamp: Date.now() };
      }
      return n;
    });
    saveNotesToStorage(updated);
  };

  const handleContentChange = () => {
    if (!activeNoteId || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " - " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, content: html, updatedAt: formattedDate, timestamp: Date.now() };
      }
      return n;
    });
    saveNotesToStorage(updated);
  };

  // execCommand formatting wrapper
  const executeCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleContentChange();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertHTMLAtCaret = (html: string) => {
    const sel = window.getSelection();
    if (sel && sel.getRangeAt && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML += html;
    }
    handleContentChange();
  };

  // Custom meteorological inserts
  const insertLocationBadge = () => {
    const lat = currentCoords.lat.toFixed(4);
    const lon = currentCoords.lon.toFixed(4);
    const elev = currentCoords.elevation;
    
    const badgeHTML = `<span 
      contenteditable="false" 
      class="inline-flex items-center space-x-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded px-1.5 py-0.5 my-0.5 mx-0.5 text-[10.5px] font-mono cursor-pointer transition-all active:scale-95"
      title="Click to center map here"
      onclick="window.dispatchEvent(new CustomEvent('focus-meteo-map', {detail: {lat: ${lat}, lon: ${lon}}}));"
    >
      📍 <span>${lat}°N, ${lon}°E</span>
      <span class="text-slate-500 text-[9px] border-l border-slate-700 pl-1 ml-1">${elev}m</span>
    </span>&nbsp;`;
    
    insertHTMLAtCaret(badgeHTML);
  };

  const insertLayerBadge = () => {
    const badgeHTML = `<span 
      contenteditable="false" 
      class="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 my-0.5 mx-0.5 text-[10.5px] font-sans font-bold"
    >
      🗺️ <span>${activeLayer.name} (${activeLayer.unit})</span>
    </span>&nbsp;`;
    
    insertHTMLAtCaret(badgeHTML);
  };

  const exportNote = () => {
    if (!activeNote) return;
    const fileContent = `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title>${activeNote.title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #cbd5e1; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
          .note-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 2rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          h1 { border-bottom: 2px solid #334155; padding-bottom: 0.5rem; color: #3b82f6; }
          .meta { font-size: 0.8rem; color: #64748b; margin-bottom: 1.5rem; display: flex; gap: 1rem; }
        </style>
      </head>
      <body>
        <div class="note-card">
          <h1>${activeNote.title}</h1>
          <div class="meta">
            <span>Last updated: ${activeNote.updatedAt}</span>
          </div>
          <div class="content">
            ${activeNote.content}
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([fileContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title.replace(/\s+/g, "_")}.html`;
    a.click();
  };

  useEffect(() => {
    const handleMapFocus = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lon: number }>;
      if (customEvent.detail) {
        onCoordsChange({
          lat: customEvent.detail.lat,
          lon: customEvent.detail.lon,
          elevation: 1000
        });
      }
    };
    window.addEventListener("focus-meteo-map", handleMapFocus);
    return () => window.removeEventListener("focus-meteo-map", handleMapFocus);
  }, [onCoordsChange]);

  useEffect(() => {
    const handleNotesUpdate = () => {
      const savedNotes = localStorage.getItem("meteo_notes");
      if (savedNotes) {
        try {
          const parsed = JSON.parse(savedNotes);
          setNotes(parsed);
        } catch (e) {
          console.error("Failed to parse updated notes", e);
        }
      }
    };
    window.addEventListener("meteo-notes-updated", handleNotesUpdate);
    return () => window.removeEventListener("meteo-notes-updated", handleNotesUpdate);
  }, []);

  const colors = [
    { name: "Default", value: "#e2e8f0" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Red", value: "#ef4444" },
    { name: "Purple", value: "#a855f7" }
  ];

  const highlights = [
    { name: "None", value: "transparent" },
    { name: "Blue", value: "rgba(59, 130, 246, 0.2)" },
    { name: "Green", value: "rgba(16, 185, 129, 0.2)" },
    { name: "Yellow", value: "rgba(245, 158, 11, 0.2)" },
    { name: "Red", value: "rgba(239, 68, 68, 0.2)" }
  ];

  // Filter notes by search query
  const filteredNotes = notes.filter(n => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(query) || stripHtml(n.content).toLowerCase().includes(query);
  });

  // Group notes chronologically
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const group = getNoteDateGroup(note);
    if (!acc[group.key]) {
      acc[group.key] = { label: group.label, badgeColor: group.badgeColor, items: [] };
    }
    acc[group.key].items.push(note);
    return acc;
  }, {} as Record<string, { label: string; badgeColor: string; items: Note[] }>);

  // Preferred order of date groups
  const groupOrder = ["today", "yesterday", "this_week", "earlier"];

  return (
    <div className="flex flex-col h-full bg-[#08090C] text-slate-200 font-sans select-none" id="notes-panel">
      {/* PANEL HEADER */}
      <div className="p-3.5 border-b border-[#1A1C23] bg-[#090A0E] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <NotebookPen className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <h2 className="text-xs font-bold text-slate-100 tracking-wide">Meteo Analysis Journal</h2>
            <p className="text-[9.5px] text-slate-500">Document Observations & Forecasts</p>
          </div>
        </div>

        {activeNoteId ? (
          <button
            onClick={() => setActiveNoteId(null)}
            className="px-2.5 py-1 bg-[#12141C] hover:bg-[#1A1E2B] text-slate-300 text-[10.5px] font-bold rounded border border-[#232736] flex items-center space-x-1 transition"
            title="Back to notes list"
          >
            <ArrowLeft className="w-3 h-3 text-slate-400" />
            <span>Notes List</span>
          </button>
        ) : (
          <button
            onClick={createNewNote}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10.5px] font-bold rounded flex items-center space-x-1 transition shadow-sm"
            title="Create new note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        )}
      </div>

      {/* VIEW 1: VERTICAL NOTES LIST (Default when no activeNoteId) */}
      {!activeNoteId && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#08090C]">
          {/* Search bar */}
          <div className="p-2.5 border-b border-[#1A1C23]/80 bg-[#0C0D12] shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search note titles or content..."
                className="w-full bg-[#12141C] border border-[#212532] text-slate-200 placeholder-slate-500 text-[11px] rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500/50 transition font-sans text-left"
                dir="ltr"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Notes Vertical Cards Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                  <NotebookPen className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">No notes yet</h4>
                  <p className="text-[10.5px] text-slate-500 mt-1 max-w-[220px]">
                    Click "New Note" above to start documenting your weather observations.
                  </p>
                </div>
                <button
                  onClick={createNewNote}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded flex items-center space-x-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Note</span>
                </button>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-sans">
                No notes found matching "{searchQuery}".
              </div>
            ) : (
              groupOrder.map(groupKey => {
                const group = groupedNotes[groupKey];
                if (!group || group.items.length === 0) return null;

                return (
                  <div key={groupKey} className="space-y-2">
                    {/* Date Category Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/50">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${group.badgeColor} font-sans`}>
                        {group.label}
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-mono">
                        {group.items.length} {group.items.length === 1 ? 'note' : 'notes'}
                      </span>
                    </div>

                    {/* Vertical Cards */}
                    <div className="space-y-2">
                      {group.items.map(note => {
                        const snippet = stripHtml(note.content).trim();

                        return (
                          <div
                            key={note.id}
                            onClick={() => {
                              setActiveNoteId(note.id);
                              setIsEditing(false);
                            }}
                            className="p-3 rounded-lg border border-[#1C1F2B] bg-[#0E1017] hover:bg-[#141722] hover:border-blue-500/40 cursor-pointer transition group relative flex flex-col space-y-2 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                <NotebookPen className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <h3 className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition truncate text-left font-sans">
                                  {note.title || "Untitled"}
                                </h3>
                              </div>

                              <button
                                onClick={(e) => deleteNote(note.id, e)}
                                className="opacity-60 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition shrink-0"
                                title="Delete note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Snippet Preview */}
                            <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed font-sans text-left">
                              {snippet || "No content..."}
                            </p>

                            {/* Footer Badges & Date */}
                            <div className="flex items-center justify-between pt-1 text-[9.5px] text-slate-500 font-sans border-t border-[#161924]">
                              <div className="flex items-center space-x-2">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-2.5 h-2.5 text-slate-500" />
                                  <span>{note.updatedAt || note.createdAt}</span>
                                </span>
                              </div>

                              <div className="flex items-center space-x-1 text-blue-400 font-medium group-hover:translate-x-0.5 transition">
                                <span>View</span>
                                <Eye className="w-2.5 h-2.5" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: NOTE DETAIL VIEW (Active when activeNoteId is selected) */}
      {activeNoteId && activeNote && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#08090C]">
          {/* Top Actions & Title Strip */}
          <div className="px-3 py-2 bg-[#0C0D12] border-b border-[#1A1C23] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 flex-1 mr-2 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-transparent text-slate-100 text-xs font-bold border-b border-blue-500/50 pb-0.5 focus:outline-none font-sans text-left"
                  placeholder="Note title..."
                  dir="ltr"
                />
              ) : (
                <h3 className="text-xs font-bold text-slate-100 truncate font-sans text-left">
                  {activeNote.title || "Untitled Note"}
                </h3>
              )}
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              {isEditing ? (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold rounded flex items-center space-x-1 transition shadow-sm"
                  title="Finish editing note"
                >
                  <Check className="w-3 h-3" />
                  <span>Done</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10.5px] font-bold rounded flex items-center space-x-1 transition shadow-sm"
                  title="Edit note content"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Note</span>
                </button>
              )}

              <button
                onClick={exportNote}
                className="p-1.5 bg-[#141722] hover:bg-[#1A1E2D] text-slate-300 rounded border border-[#212536] transition"
                title="Download HTML file"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={(e) => deleteNote(activeNote.id, e)}
                className="p-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 rounded border border-red-500/20 transition"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <>
              {/* Rich Text Toolbar */}
              <div className="px-3 py-1.5 bg-[#0A0B0F] border-b border-[#1A1C23] flex flex-wrap gap-1 items-center shrink-0">
                {/* Inline Styles */}
                <button
                  onClick={() => executeCommand("bold")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCommand("italic")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCommand("underline")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCommand("strikeThrough")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                {/* Text Color Picker */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowColorPicker(!showColorPicker);
                      setShowHighlightPicker(false);
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition flex items-center space-x-0.5"
                    title="Text Color"
                  >
                    <Palette className="w-3.5 h-3.5 text-blue-400" />
                    <ChevronDown className="w-2 h-2" />
                  </button>
                  {showColorPicker && (
                    <div className="absolute top-7 left-0 z-50 bg-[#12141a] border border-[#212530] rounded p-1.5 shadow-xl grid grid-cols-3 gap-1 w-24">
                      {colors.map(c => (
                        <button
                          key={c.name}
                          onClick={() => {
                            executeCommand("foreColor", c.value);
                            setShowColorPicker(false);
                          }}
                          className="w-5 h-5 rounded border border-slate-700 hover:scale-110 transition"
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Alignments */}
                <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                <button
                  onClick={() => executeCommand("justifyLeft")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCommand("justifyCenter")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCommand("justifyRight")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                {/* Lists */}
                <button
                  onClick={() => executeCommand("insertUnorderedList")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => executeCommand("insertOrderedList")}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Meteorological Dynamic Badge Insertion Strip */}
              <div className="px-3 py-1.5 bg-[#07080B] border-b border-[#1A1C23]/60 flex items-center space-x-2 shrink-0">
                <span className="text-[9.5px] font-bold text-slate-500 font-sans">Stamp:</span>
                <button
                  onClick={insertLocationBadge}
                  className="px-2 py-0.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[10px] rounded flex items-center space-x-1 transition"
                  title="Insert current map coordinates"
                >
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>Insert Location 📍</span>
                </button>
                <button
                  onClick={insertLayerBadge}
                  className="px-2 py-0.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[10px] rounded flex items-center space-x-1 transition"
                  title="Insert active weather layer name"
                >
                  <LayersIcon className="w-3 h-3 text-emerald-400" />
                  <span>Insert Layer 🗺️</span>
                </button>
              </div>

              {/* Writing Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 bg-[#08090C] custom-scrollbar select-text cursor-text"
                onClick={(e) => {
                  if (editorRef.current && e.target === e.currentTarget) {
                    editorRef.current.focus();
                  }
                }}
              >
                {/* Meta and timestamps */}
                <div className="flex justify-between text-[9px] text-slate-500 font-mono select-none border-b border-slate-800/40 pb-2" dir="ltr">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    <span>Updated: {activeNote.updatedAt}</span>
                  </span>
                  <span>ID: #{activeNote.id}</span>
                </div>

                {/* Notion-style contentEditable Workspace */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleContentChange}
                  className="flex-1 w-full bg-transparent text-slate-200 text-xs leading-relaxed focus:outline-none min-h-[250px] font-sans selection:bg-blue-500/30 text-left"
                  dir="ltr"
                  id="meteo-rich-editor"
                />
              </div>
            </>
          ) : (
            /* Read-Only Content Preview View */
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 bg-[#08090C] custom-scrollbar select-text">
              {/* Meta and timestamps */}
              <div className="flex justify-between text-[9px] text-slate-500 font-mono select-none border-b border-slate-800/40 pb-2.5" dir="ltr">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  <span>Updated: {activeNote.updatedAt}</span>
                </span>
                <span>ID: #{activeNote.id}</span>
              </div>

              {/* Note Content Display */}
              <div 
                className="text-xs text-slate-200 leading-relaxed font-sans text-left space-y-2 select-text"
                dangerouslySetInnerHTML={{ __html: activeNote.content }}
              />

              {/* Edit Note Footer Action */}
              <div className="pt-4 border-t border-slate-800/50 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold rounded flex items-center space-x-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

