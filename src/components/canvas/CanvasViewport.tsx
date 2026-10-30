import React, { useRef, useState, useEffect, useCallback } from "react";
import { CanvasDocument, CanvasItem, CanvasTool, CanvasViewport as ICanvasViewport } from "../../types/canvas";
import { LiveMapCard } from "./items/LiveMapCard";
import { MapSnapshotCard } from "./items/MapSnapshotCard";
import { ClimateIndexCard } from "./items/ClimateIndexCard";
import { ChartCard } from "./items/ChartCard";
import { ImageCard } from "./items/ImageCard";
import { TextCard } from "./items/TextCard";
import { AnnotationCard } from "./items/AnnotationCard";
import { FrameCard } from "./items/FrameCard";

interface CanvasViewportProps {
  document: CanvasDocument;
  activeTool: CanvasTool;
  selectedIds: string[];
  isPresentationMode: boolean;
  onSelectIds: (ids: string[]) => void;
  onUpdateItem: (id: string, updated: Partial<CanvasItem>) => void;
  onUpdateViewport: (viewport: ICanvasViewport) => void;
  onDuplicateItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  document,
  activeTool,
  selectedIds,
  isPresentationMode,
  onSelectIds,
  onUpdateItem,
  onUpdateViewport,
  onDuplicateItem,
  onDeleteItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan / Drag State
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging selected items
  const [isDraggingItems, setIsDraggingItems] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialItemPositions, setInitialItemPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Resizing state
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [initialResizeBox, setInitialResizeBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Marquee Selection Box
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Spacebar pan detector
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpacePressed && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  // Convert Screen pixel coordinates to Canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;
    return {
      x: (relX - document.viewport.x) / document.viewport.zoom,
      y: (relY - document.viewport.y) / document.viewport.zoom
    };
  }, [document.viewport]);

  // Wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(document.viewport.zoom * zoomFactor, 0.15), 3.5);

    // Keep point under cursor invariant
    const newX = cursorX - (cursorX - document.viewport.x) * (newZoom / document.viewport.zoom);
    const newY = cursorY - (cursorY - document.viewport.y) * (newZoom / document.viewport.zoom);

    onUpdateViewport({
      x: newX,
      y: newY,
      zoom: newZoom
    });
  };

  // Mouse Down on background
  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle click or space is held or tool is "hand"
    if (e.button === 1 || isSpacePressed || activeTool === "hand") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - document.viewport.x, y: e.clientY - document.viewport.y });
      return;
    }

    // Left click on blank canvas -> Marquee selection or Deselect
    if (e.button === 0 && e.target === containerRef.current) {
      if (!e.shiftKey) {
        onSelectIds([]);
      }
      const canvasCoord = screenToCanvas(e.clientX, e.clientY);
      setSelectionBox({
        startX: canvasCoord.x,
        startY: canvasCoord.y,
        currentX: canvasCoord.x,
        currentY: canvasCoord.y
      });
    }
  };

  // Global Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      onUpdateViewport({
        ...document.viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (selectionBox) {
      const canvasCoord = screenToCanvas(e.clientX, e.clientY);
      setSelectionBox(prev => prev ? { ...prev, currentX: canvasCoord.x, currentY: canvasCoord.y } : null);
      return;
    }

    if (isDraggingItems && selectedIds.length > 0) {
      const canvasCoord = screenToCanvas(e.clientX, e.clientY);
      const deltaX = canvasCoord.x - dragStartPos.x;
      const deltaY = canvasCoord.y - dragStartPos.y;

      // Update positions for all selected items
      selectedIds.forEach(id => {
        const initial = initialItemPositions[id];
        if (initial) {
          // Snap to 10px grid
          const snappedX = Math.round((initial.x + deltaX) / 10) * 10;
          const snappedY = Math.round((initial.y + deltaY) / 10) * 10;
          onUpdateItem(id, { x: snappedX, y: snappedY });

          // If item is a frame, also move all children belonging to this frame
          const item = document.items.find(it => it.id === id);
          if (item && item.type === "frame") {
            const children = document.items.filter(it => it.frameId === id);
            children.forEach(child => {
              const childInit = initialItemPositions[child.id];
              if (childInit) {
                onUpdateItem(child.id, {
                  x: Math.round((childInit.x + deltaX) / 10) * 10,
                  y: Math.round((childInit.y + deltaY) / 10) * 10
                });
              }
            });
          }
        }
      });
      return;
    }

    if (resizingHandle && resizingItemId && initialResizeBox) {
      const canvasCoord = screenToCanvas(e.clientX, e.clientY);
      const dx = canvasCoord.x - dragStartPos.x;
      const dy = canvasCoord.y - dragStartPos.y;

      let newX = initialResizeBox.x;
      let newY = initialResizeBox.y;
      let newW = initialResizeBox.width;
      let newH = initialResizeBox.height;

      if (resizingHandle.includes("e")) newW = Math.max(160, initialResizeBox.width + dx);
      if (resizingHandle.includes("s")) newH = Math.max(120, initialResizeBox.height + dy);
      if (resizingHandle.includes("w")) {
        const potentialW = initialResizeBox.width - dx;
        if (potentialW > 160) {
          newW = potentialW;
          newX = initialResizeBox.x + dx;
        }
      }
      if (resizingHandle.includes("n")) {
        const potentialH = initialResizeBox.height - dy;
        if (potentialH > 120) {
          newH = potentialH;
          newY = initialResizeBox.y + dy;
        }
      }

      onUpdateItem(resizingItemId, {
        x: Math.round(newX / 10) * 10,
        y: Math.round(newY / 10) * 10,
        width: Math.round(newW / 10) * 10,
        height: Math.round(newH / 10) * 10
      });
    }
  };

  // Global Mouse Up
  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);

    if (selectionBox) {
      // Find items intersecting selection box
      const minX = Math.min(selectionBox.startX, selectionBox.currentX);
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
      const minY = Math.min(selectionBox.startY, selectionBox.currentY);
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY);

      if (Math.abs(maxX - minX) > 5 || Math.abs(maxY - minY) > 5) {
        const intersecting = document.items.filter(item => {
          return item.x < maxX && item.x + item.width > minX && item.y < maxY && item.y + item.height > minY;
        }).map(it => it.id);

        onSelectIds(intersecting);
      }
      setSelectionBox(null);
    }

    if (isDraggingItems) setIsDraggingItems(false);
    if (resizingHandle) {
      setResizingHandle(null);
      setResizingItemId(null);
      setInitialResizeBox(null);
    }
  };

  // Item mouse down for selection and dragging
  const handleItemMouseDown = (e: React.MouseEvent, item: CanvasItem) => {
    if (item.isLocked || isSpacePressed || activeTool === "hand") return;
    e.stopPropagation();

    if (e.shiftKey) {
      if (selectedIds.includes(item.id)) {
        onSelectIds(selectedIds.filter(id => id !== item.id));
      } else {
        onSelectIds([...selectedIds, item.id]);
      }
    } else {
      if (!selectedIds.includes(item.id)) {
        onSelectIds([item.id]);
      }
    }

    const canvasCoord = screenToCanvas(e.clientX, e.clientY);
    setIsDraggingItems(true);
    setDragStartPos(canvasCoord);

    // Save positions of all items in current selection
    const positions: Record<string, { x: number; y: number }> = {};
    const itemsToTrack = selectedIds.includes(item.id) 
      ? document.items.filter(it => selectedIds.includes(it.id))
      : [item];

    itemsToTrack.forEach(it => {
      positions[it.id] = { x: it.x, y: it.y };
      // Also track children if frame
      if (it.type === "frame") {
        document.items.filter(c => c.frameId === it.id).forEach(c => {
          positions[c.id] = { x: c.x, y: c.y };
        });
      }
    });

    setInitialItemPositions(positions);
  };

  // Handle resize handle mouse down
  const handleResizeStart = (e: React.MouseEvent, item: CanvasItem, handle: string) => {
    if (item.isLocked) return;
    e.stopPropagation();
    setResizingHandle(handle);
    setResizingItemId(item.id);
    const canvasCoord = screenToCanvas(e.clientX, e.clientY);
    setDragStartPos(canvasCoord);
    setInitialResizeBox({ x: item.x, y: item.y, width: item.width, height: item.height });
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`flex-1 w-full h-full relative overflow-hidden bg-[#060709] select-none ${
        isSpacePressed || activeTool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
      style={{
        backgroundImage: `radial-gradient(#151922 1.2px, transparent 1.2px)`,
        backgroundSize: `${24 * document.viewport.zoom}px ${24 * document.viewport.zoom}px`,
        backgroundPosition: `${document.viewport.x}px ${document.viewport.y}px`
      }}
    >
      {/* Canvas World Container transformed with Matrix */}
      <div
        className="absolute top-0 left-0 w-full h-full origin-top-left pointer-events-none"
        style={{
          transform: `translate(${document.viewport.x}px, ${document.viewport.y}px) scale(${document.viewport.zoom})`
        }}
      >
        {/* Render Frames First (underneath children) */}
        {document.items.filter(item => item.type === "frame").map(item => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onMouseDown={(e) => handleItemMouseDown(e, item)}
              className="absolute pointer-events-auto"
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
                zIndex: item.zIndex || 1
              }}
            >
              <FrameCard
                item={item as any}
                isSelected={isSelected}
                onUpdate={(up) => onUpdateItem(item.id, up)}
                onDuplicate={() => onDuplicateItem(item.id)}
                onDelete={() => onDeleteItem(item.id)}
              />
            </div>
          );
        })}

        {/* Render Other Items */}
        {document.items.filter(item => item.type !== "frame").map(item => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onMouseDown={(e) => handleItemMouseDown(e, item)}
              className={`absolute pointer-events-auto transition-shadow ${
                isSelected ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-black/50" : ""
              }`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
                zIndex: item.zIndex || 2
              }}
            >
              {item.type === "live_map" && (
                <LiveMapCard
                  item={item}
                  isSelected={isSelected}
                  syncGroups={document.syncGroups}
                  onUpdate={(up) => onUpdateItem(item.id, up)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              )}
              {item.type === "map_snapshot" && (
                <MapSnapshotCard
                  item={item}
                  isSelected={isSelected}
                  onUpdate={(up) => onUpdateItem(item.id, up)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              )}
              {item.type === "climate_index" && (
                <ClimateIndexCard
                  item={item}
                  isSelected={isSelected}
                  onUpdate={(up) => onUpdateItem(item.id, up)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              )}
              {item.type === "chart" && (
                <ChartCard
                  item={item}
                  isSelected={isSelected}
                  onUpdate={(up) => onUpdateItem(item.id, up)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              )}
              {item.type === "image" && (
                <ImageCard
                  item={item}
                  isSelected={isSelected}
                  onUpdate={(up) => onUpdateItem(item.id, up)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              )}
              {item.type === "text" && (
                <TextCard
                  item={item}
                  isSelected={isSelected}
                  onUpdate={(up) => onUpdateItem(item.id, up)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              )}
              {item.type === "annotation" && (
                <AnnotationCard
                  item={item}
                  isSelected={isSelected}
                  onUpdate={(up) => onUpdateItem(item.id, up)}
                  onDuplicate={() => onDuplicateItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              )}

              {/* 8-Point Resize Handles (shown when selected and not in presentation mode) */}
              {isSelected && !isPresentationMode && !item.isLocked && (
                <>
                  <div onMouseDown={(e) => handleResizeStart(e, item, "nw")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute -top-1.5 -left-1.5 cursor-nwse-resize z-50 shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, item, "n")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute -top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize z-50 shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, item, "ne")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute -top-1.5 -right-1.5 cursor-nesw-resize z-50 shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, item, "e")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize z-50 shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, item, "se")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute -bottom-1.5 -right-1.5 cursor-nwse-resize z-50 shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, item, "s")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute -bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize z-50 shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, item, "sw")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute -bottom-1.5 -left-1.5 cursor-nesw-resize z-50 shadow-md" />
                  <div onMouseDown={(e) => handleResizeStart(e, item, "w")} className="w-2.5 h-2.5 bg-cyan-400 rounded-xs absolute top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize z-50 shadow-md" />
                </>
              )}
            </div>
          );
        })}

        {/* Marquee Selection Rectangle */}
        {selectionBox && (
          <div
            className="absolute border border-cyan-400 bg-cyan-500/10 pointer-events-none z-50"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
              width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`
            }}
          />
        )}
      </div>

      {/* Viewport Floating Coordinates & Zoom Indicator */}
      <div className="absolute bottom-3 right-4 bg-[#0A0D14]/90 backdrop-blur-md px-3 py-1.5 rounded border border-[#1A1F2C] text-[10px] font-mono text-slate-400 flex items-center space-x-3 pointer-events-none select-none z-40 shadow-xl">
        <span>X: {Math.round(document.viewport.x)} Y: {Math.round(document.viewport.y)}</span>
        <span>·</span>
        <span className="text-cyan-400 font-bold">{Math.round(document.viewport.zoom * 100)}%</span>
        <span>·</span>
        <span>{document.items.length} items</span>
      </div>
    </div>
  );
};
