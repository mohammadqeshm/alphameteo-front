import React, { useState, useEffect, useCallback, useRef } from "react";
import { CanvasDocument, CanvasItem, CanvasTool, CanvasViewport as ICanvasViewport, SyncGroup } from "../../types/canvas";
import {
  HORMOZGAN_CONVECTIVE_OUTLOOK_TEMPLATE,
  MODEL_COMPARISON_TEMPLATE,
  BLANK_CANVAS_TEMPLATE
} from "../../data/canvasTemplates";
import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasViewport } from "./CanvasViewport";
import { AddObjectModal } from "./AddObjectModal";
import { QuickAddPalette } from "./QuickAddPalette";
import { SyncGroupsModal } from "./SyncGroupsModal";
import html2canvas from "html2canvas";

import { defaultCanvasRepository } from "../../services/canvas/canvasRepository";

interface AnalysisCanvasProps {
  onReturnToMap?: () => void;
  incomingSnapshot?: Partial<CanvasItem> | null;
  onClearIncomingSnapshot?: () => void;
}

export const AnalysisCanvas: React.FC<AnalysisCanvasProps> = ({
  onReturnToMap,
  incomingSnapshot,
  onClearIncomingSnapshot,
}) => {
  // Document State - initialize synchronously from localStorage or fallback, then sync via repository
  const [doc, setDoc] = useState<CanvasDocument>(() => {
    try {
      const raw = localStorage.getItem("alpha_meteo_canvas_doc_v1_primary");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) return parsed;
      }
    } catch {}
    return HORMOZGAN_CONVECTIVE_OUTLOOK_TEMPLATE;
  });

  // History Stack for Undo/Redo
  const [historyPast, setHistoryPast] = useState<CanvasItem[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<CanvasItem[][]>([]);

  // Selection & Tooling
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Clipboard for Copy / Paste
  const [clipboardItems, setClipboardItems] = useState<CanvasItem[]>([]);

  // Canvas Stage Reference for PNG export
  const canvasStageRef = useRef<HTMLDivElement>(null);

  // Autosave to repository on change
  useEffect(() => {
    defaultCanvasRepository.saveDocument(doc).catch(err => {
      console.error("[AnalysisCanvas] Autosave error:", err);
    });
  }, [doc]);

  // Ingest incoming snapshot from main map if passed
  useEffect(() => {
    if (incomingSnapshot) {
      handleAddItem({
        ...incomingSnapshot,
        x: -doc.viewport.x / doc.viewport.zoom + 200,
        y: -doc.viewport.y / doc.viewport.zoom + 150
      });
      if (onClearIncomingSnapshot) onClearIncomingSnapshot();
    }
  }, [incomingSnapshot]);

  // Record history snapshot before mutating items
  const pushHistory = useCallback(() => {
    setHistoryPast(prev => [...prev.slice(-25), doc.items]);
    setHistoryFuture([]);
  }, [doc.items]);

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryFuture(prev => [doc.items, ...prev]);
    setHistoryPast(prev => prev.slice(0, prev.length - 1));
    setDoc(prev => ({ ...prev, items: previous, updatedAt: Date.now() }));
  }, [historyPast, doc.items]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryPast(prev => [...prev, doc.items]);
    setHistoryFuture(prev => prev.slice(1));
    setDoc(prev => ({ ...prev, items: next, updatedAt: Date.now() }));
  }, [historyFuture, doc.items]);

  // Update Item & Propagate Sync Group if applicable
  const handleUpdateItem = useCallback((id: string, updated: Partial<CanvasItem>) => {
    setDoc(prev => {
      const target = prev.items.find(it => it.id === id);
      if (!target) return prev;

      let nextItems = prev.items.map(it => it.id === id ? { ...it, ...updated } : it);

      // If item belongs to a sync group and updated its coordinates or forecast time
      if (target.type === "live_map" && (target as any).syncGroupId) {
        const syncGroupId = (target as any).syncGroupId;
        const group = prev.syncGroups.find(g => g.id === syncGroupId);

        if (group && (updated as any).coords && group.syncCoords) {
          const newCoords = (updated as any).coords;
          nextItems = nextItems.map(it => {
            if (it.id !== id && it.type === "live_map" && (it as any).syncGroupId === syncGroupId) {
              return { ...it, coords: newCoords };
            }
            return it;
          });
        }
      }

      return {
        ...prev,
        items: nextItems as CanvasItem[],
        updatedAt: Date.now()
      };
    });
  }, []);

  // Add Item to Canvas
  const handleAddItem = (itemPartial: Partial<CanvasItem>) => {
    pushHistory();
    const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newItem: CanvasItem = {
      id,
      type: itemPartial.type || "text",
      title: itemPartial.title || "New Canvas Item",
      x: itemPartial.x ?? (-doc.viewport.x / doc.viewport.zoom + 220),
      y: itemPartial.y ?? (-doc.viewport.y / doc.viewport.zoom + 160),
      width: itemPartial.width || 420,
      height: itemPartial.height || 360,
      zIndex: Math.max(...doc.items.map(it => it.zIndex || 1), 1) + 1,
      createdAt: Date.now(),
      ...itemPartial
    } as CanvasItem;

    setDoc(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      updatedAt: Date.now()
    }));
    setSelectedIds([id]);
  };

  // Duplicate Item
  const handleDuplicateItem = (id: string) => {
    const item = doc.items.find(it => it.id === id);
    if (!item) return;
    pushHistory();
    const dup: CanvasItem = {
      ...item,
      id: `item_${Date.now()}_dup`,
      title: item.title ? `${item.title} (Copy)` : undefined,
      x: item.x + 30,
      y: item.y + 30,
      createdAt: Date.now()
    };
    setDoc(prev => ({
      ...prev,
      items: [...prev.items, dup],
      updatedAt: Date.now()
    }));
    setSelectedIds([dup.id]);
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    pushHistory();
    setDoc(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id),
      updatedAt: Date.now()
    }));
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  // Template Switcher
  const handleSelectTemplate = (key: string) => {
    pushHistory();
    if (key === "hormozgan") {
      setDoc({ ...HORMOZGAN_CONVECTIVE_OUTLOOK_TEMPLATE, updatedAt: Date.now() });
    } else if (key === "model_comparison") {
      setDoc({ ...MODEL_COMPARISON_TEMPLATE, updatedAt: Date.now() });
    } else if (key === "blank") {
      setDoc({ ...BLANK_CANVAS_TEMPLATE, updatedAt: Date.now() });
    }
    setSelectedIds([]);
  };

  // Zoom Controls
  const handleZoomIn = () => {
    setDoc(prev => ({
      ...prev,
      viewport: { ...prev.viewport, zoom: Math.min(prev.viewport.zoom * 1.2, 3.5) }
    }));
  };

  const handleZoomOut = () => {
    setDoc(prev => ({
      ...prev,
      viewport: { ...prev.viewport, zoom: Math.max(prev.viewport.zoom * 0.8, 0.2) }
    }));
  };

  const handleResetZoom = () => {
    setDoc(prev => ({
      ...prev,
      viewport: { ...prev.viewport, zoom: 1.0 }
    }));
  };

  const handleZoomToFit = () => {
    if (doc.items.length === 0) return;
    const minX = Math.min(...doc.items.map(it => it.x));
    const maxX = Math.max(...doc.items.map(it => it.x + it.width));
    const minY = Math.min(...doc.items.map(it => it.y));
    const maxY = Math.max(...doc.items.map(it => it.y + it.height));

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const targetZoom = Math.min(Math.max(800 / Math.max(contentW, 1), 0.3), 1.2);
    setDoc(prev => ({
      ...prev,
      viewport: {
        x: -minX * targetZoom + 60,
        y: -minY * targetZoom + 60,
        zoom: targetZoom
      }
    }));
  };

  // Export Canvas to PNG
  const handleExportPng = async () => {
    if (!canvasStageRef.current) return;
    try {
      const canvas = await html2canvas(canvasStageRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#060709",
        scale: 2 // High-res 2x
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Alpha_Meteo_Analysis_${doc.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch (err) {
      console.error("Canvas export failed:", err);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) return;

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsQuickAddOpen(true);
        return;
      }

      if (e.key === "v" || e.key === "V") {
        setActiveTool("select");
      } else if (e.key === "h" || e.key === "H") {
        setActiveTool("hand");
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          pushHistory();
          setDoc(prev => ({
            ...prev,
            items: prev.items.filter(it => !selectedIds.includes(it.id)),
            updatedAt: Date.now()
          }));
          setSelectedIds([]);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        handleRedo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        if (selectedIds.length > 0) {
          selectedIds.forEach(id => handleDuplicateItem(id));
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        if (selectedIds.length > 0) {
          const itemsToCopy = doc.items.filter(it => selectedIds.includes(it.id));
          setClipboardItems(itemsToCopy);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        if (clipboardItems.length > 0) {
          pushHistory();
          const pasted = clipboardItems.map(it => ({
            ...it,
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            x: it.x + 40,
            y: it.y + 40,
            createdAt: Date.now()
          }));
          setDoc(prev => ({
            ...prev,
            items: [...prev.items, ...pasted],
            updatedAt: Date.now()
          }));
          setSelectedIds(pasted.map(it => it.id));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, clipboardItems, doc.items, handleUndo, handleRedo, pushHistory]);

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#060709] relative select-none">
      {/* Top Canvas Toolbar (Hidden in presentation mode) */}
      {!isPresentationMode && (
        <CanvasToolbar
          activeTool={activeTool}
          document={doc}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          isPresentationMode={isPresentationMode}
          onSelectTool={(tool) => setActiveTool(tool)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onSelectTemplate={handleSelectTemplate}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onZoomToFit={handleZoomToFit}
          onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
          onExportPng={handleExportPng}
        />
      )}

      {/* Main Spatial Stage */}
      <div ref={canvasStageRef} className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        <CanvasViewport
          document={doc}
          activeTool={activeTool}
          selectedIds={selectedIds}
          isPresentationMode={isPresentationMode}
          onSelectIds={setSelectedIds}
          onUpdateItem={handleUpdateItem}
          onUpdateViewport={(viewport) => setDoc(prev => ({ ...prev, viewport }))}
          onDuplicateItem={handleDuplicateItem}
          onDeleteItem={handleDeleteItem}
        />
      </div>

      {/* Exit presentation mode floating badge */}
      {isPresentationMode && (
        <button
          onClick={() => setIsPresentationMode(false)}
          className="absolute top-4 right-4 z-50 bg-[#0E121B]/90 hover:bg-[#181D2C] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#1A1F2C] shadow-2xl transition"
        >
          Exit Presentation Mode (ESC)
        </button>
      )}

      {/* Modals */}
      <AddObjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />

      <QuickAddPalette
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelect={handleAddItem}
      />

      <SyncGroupsModal
        isOpen={isSyncModalOpen}
        syncGroups={doc.syncGroups}
        onClose={() => setIsSyncModalOpen(false)}
        onUpdateSyncGroups={(syncGroups) => setDoc(prev => ({ ...prev, syncGroups }))}
      />
    </div>
  );
};
