import React, { useState } from "react";
import { SyncGroup } from "../../types/canvas";
import { X, Link2, Plus, Trash2, Check, Clock, Compass } from "lucide-react";

interface SyncGroupsModalProps {
  isOpen: boolean;
  syncGroups: SyncGroup[];
  onClose: () => void;
  onUpdateSyncGroups: (groups: SyncGroup[]) => void;
}

export const SyncGroupsModal: React.FC<SyncGroupsModalProps> = ({
  isOpen,
  syncGroups,
  onClose,
  onUpdateSyncGroups,
}) => {
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupColor, setNewGroupColor] = useState<string>("#38BDF8");

  if (!isOpen) return null;

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: SyncGroup = {
      id: `sync_grp_${Date.now()}`,
      name: newGroupName.trim(),
      color: newGroupColor,
      syncCoords: true,
      syncTime: true
    };
    onUpdateSyncGroups([...syncGroups, newGroup]);
    setNewGroupName("");
  };

  const handleDeleteGroup = (id: string) => {
    onUpdateSyncGroups(syncGroups.filter(g => g.id !== id));
  };

  const handleToggleSyncCoords = (id: string) => {
    onUpdateSyncGroups(syncGroups.map(g => g.id === id ? { ...g, syncCoords: !g.syncCoords } : g));
  };

  const handleToggleSyncTime = (id: string) => {
    onUpdateSyncGroups(syncGroups.map(g => g.id === id ? { ...g, syncTime: !g.syncTime } : g));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs select-none">
      <div className="w-[520px] max-w-[95vw] bg-[#0A0D14] border border-[#1A1F2C] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="h-12 bg-[#0E121B] border-b border-[#1A1F2C] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-white tracking-wide">
              Map Synchronization Groups
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 bg-[#06080C] max-h-[70vh] overflow-y-auto custom-scrollbar">
          <p className="text-xs text-slate-400 leading-relaxed">
            By default, canvas map cards are independent. Assigning map cards to a Sync Group links their pan/zoom coordinates and forecast valid times so multi-model comparisons stay in lockstep.
          </p>

          {/* New Group Creator */}
          <div className="flex items-center space-x-2 bg-[#0C101A] p-2.5 rounded-lg border border-[#1A2234]">
            <input
              type="color"
              value={newGroupColor}
              onChange={(e) => setNewGroupColor(e.target.value)}
              className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              placeholder="e.g. Hormozgan Mesoscale Box"
              className="flex-1 bg-[#121622] text-xs text-white px-2.5 py-1.5 rounded border border-[#1A1F2C] outline-none placeholder-slate-600"
            />
            <button
              onClick={handleCreateGroup}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>

          {/* Group List */}
          <div className="space-y-2">
            {syncGroups.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-[#1A1F2C] rounded-lg">
                No active sync groups. Maps will remain completely independent.
              </div>
            ) : (
              syncGroups.map(group => (
                <div
                  key={group.id}
                  className="p-3 bg-[#0C101A] border border-[#1A2234] rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                    <span className="font-semibold text-xs text-slate-200">{group.name}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    {/* Toggle Coords Sync */}
                    <button
                      onClick={() => handleToggleSyncCoords(group.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded border text-[10px] font-mono transition ${
                        group.syncCoords ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-[#121622] text-slate-500 border-[#1A1F2C]"
                      }`}
                      title="Toggle spatial coordinate synchronization"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Sync Map View</span>
                    </button>

                    {/* Toggle Time Sync */}
                    <button
                      onClick={() => handleToggleSyncTime(group.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded border text-[10px] font-mono transition ${
                        group.syncTime ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-[#121622] text-slate-500 border-[#1A1F2C]"
                      }`}
                      title="Toggle forecast valid timestep synchronization"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Sync Forecast Time</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                      title="Delete Sync Group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
