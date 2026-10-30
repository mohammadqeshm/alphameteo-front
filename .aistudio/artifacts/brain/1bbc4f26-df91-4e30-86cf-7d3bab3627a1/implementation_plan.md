# Meteorological Analysis Canvas: Architectural Implementation Plan

An enterprise-grade, Figma-like spatial analysis workspace integrated directly into Alpha Meteo. Forecasters and meteorological analysts can freely combine interactive live maps, georeferenced snapshots, real-time climate indices, synoptic charts, soundings, satellite imagery, annotations, and structured forecast frames on an infinite 2D canvas.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been aligned based on user clarification and will govern the implementation:

- **Navigation Integration (Confirmed)**: A clean workspace mode toggle in the top navigation header (`Operational Map` | `Analysis Canvas`). Selecting `Analysis Canvas` cleanly swaps out the central map viewport with the spatial canvas workspace while preserving the global header, satellite clocks, search, and user tools.
- **Initial Showcase Canvas (Confirmed)**: The default starting canvas is pre-populated with the **Hormozgan Severe Convective Outlook** template—featuring live ECMWF 500 hPa geopotential height, Persian Gulf high-resolution radar/satellite, thermodynamic skew-T sounding / CAPE meteogram, Persian Gulf SST / IOD climate index telemetry, forecaster synoptic reasoning notes, and convective warning polygons.
- **Synchronization Engine (Confirmed)**: Canvas items are independent by default, with an opt-in **Sync Group** architecture (e.g. Group A, Group B) allowing forecasters to synchronize spatial extents (zoom, latitude, longitude) and forecast timestamps with source-specific temporal tolerances across linked map nodes.
- **Export Fidelity & WebGL Capture**: Uses direct WebGL canvas compositing with `preserveDrawingBuffer` to ensure embedded MapLibre maps, contour shaders, and vector annotations export cleanly into high-resolution PNGs without black tiles.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms Alpha Meteo from a single-map viewer into an infinite spatial briefing and analysis studio. Forecasters can pan, zoom, lay out side-by-side model runs (ECMWF vs GFS), cross-reference ENSO/IOD climate anomalies against regional weather, draw synoptic fronts and convective watch zones, frame briefings into presentation decks, and export publishable situation reports.
- **Target Audience / Persona**: Operational meteorologists, severe storm forecasters, marine dispatchers in the Persian Gulf and Hormozgan sector, and research climatologists needing a unified workstation for multi-model synthesis.
- **Key Value**: Eliminates tab-switching and fragmented analysis. Consolidates numerical weather predictions (NWP), satellite observations, climate teleconnections, and human meteorological reasoning into one persistent, interactive visual surface.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Workspace Switch & Canvas Initiation**:
   - In the global header, the forecaster toggles between `Operational Map` and `Analysis Canvas`.
   - The central area reveals the infinite spatial workspace, initially loaded with the **Hormozgan Severe Convective Outlook** template.
2. **Spatial Navigation & Layout**:
   - Pan freely with `Space + Drag` or middle mouse button; smooth pinch or wheel zooming (`10%` to `400%`) centered on cursor.
   - Objects can be selected, multi-selected with drag selection marquee or `Shift + Click`, dragged with snap guides, resized via 8-point handles, locked, duplicated (`Ctrl+D`), and organized into labeled frames.
3. **Adding & Ingesting Weather Items**:
   - Top canvas toolbar and quick-add command palette (`/`) provide 1-click insertion for:
     - **Live Map**: Fully interactive MapLibre node with independent model, run, level, and layer selection.
     - **Map Snapshot**: "Send to Canvas" action in the main operational map sends georeferenced snapshots with exact run/valid metadata pills.
     - **Climate Indices**: Interactive ENSO (Niño 1+2, 3, 3.4, 4, ONI), MJO Wheeler-Hendon phase diagram, IOD, and NAO telemetry cards with anomaly timelines.
     - **Meteorological Charts**: Skew-T thermodynamic sounding, meteogram, and ensemble plume cards.
     - **Images & Imagery**: Local upload, drag-and-drop, clipboard paste (`Ctrl+V`), and saved satellite loops.
     - **Forecaster Notes & Markdown**: Rich text blocks with heading, body, and callout styling.
     - **Synoptic Annotations**: Convective watch polygons, wind arrows, frontal boundaries, troughs, and sticky notes.
     - **Analysis Frames**: Structural sections (e.g., "Synoptic Overview", "Mesoscale Convection", "Marine Hazards") that nest and move child items together.
4. **Presentation & Export**:
   - **Presentation Mode**: Fullscreen briefing mode hiding editing tools, allowing stepped navigation between frames.
   - **High-Res Export**: Instant PNG report generation preserving high-resolution map shaders and GIS annotations.

### Visual Identity & Theme (Scientific Tactical Dark)

Consistent with Alpha Meteo's dark tactical cockpit aesthetic:
- **Canvas Neutral (60%)**: Deep obsidian grid `#060709` with subtle dot-matrix coordinate markers (`#151922` at 24px pitch).
- **Structural Surfaces (30%)**: Flat slate card containers `#0C0E14` with crisp 1px hairline borders (`#1A1F2C`), subtle hover glow (`#252C3D`), and drag guides (`#38BDF8`).
- **Telemetry Accents (10%)**: Calibrated cyan (`#38BDF8`), alert amber (`#F59E0B`), and convective crimson (`#EF4444`).
- **Typography**: Interface and labels set in `Plus Jakarta Sans` / `DM Sans`; all timestamps, coordinates, pressure levels, and indices set in tabular monospace (`font-mono tabular-nums`). Zero-pill discipline: quiet metadata lines with `·` separators.

---

## 3. Key Product Decisions & Trade-Offs

- **Custom Performant Canvas Engine vs External Bloated Libraries**:
  - *Chosen Approach*: Lightweight, high-performance custom 2D canvas transform matrix (`panX`, `panY`, `zoom`) with pointer event orchestration, RAF-throttled rendering, and bounding-box spatial indexing.
  - *Why*: Eliminates dependency fragility, ensures 100% compatibility with embedded MapLibre GL instances, and prevents iframe/pointer event conflicts.
- **Embedded Interactive MapLibre Instances with Viewport Culling**:
  - *Chosen Approach*: Embedded live maps render real MapLibre maps when within the visible canvas viewport, and suspend rendering or freeze into lightweight preview buffers when zoomed out beyond interactive thresholds or scrolled off-screen.
  - *Why*: Guarantees smooth 60fps canvas panning even with 4+ live maps on screen.
- **Client-Side Document Persistence & LocalStorage**:
  - *Chosen Approach*: Automatic debounced persistence to browser `localStorage` with JSON export/import capability and pre-packaged built-in templates.
  - *Why*: Immediate zero-latency autosave, complete data privacy, and full offline resilience without requiring backend database provisioning.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALPHA METEO APPLICATION                         │
├────────────────────────────────────────────────────────────────────────┤
│  Top Global Navigation Header (Logo, Search, Clock, Workspace Switcher)│
│  [ Operational Map View ]  │  [ Analysis Canvas Studio ]               │
└──────────────────┬─────────────────────────────┬───────────────────────┘
                   │                             │
                   ▼                             ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ Operational Map Engine (Single/  │  │ Analysis Canvas Workspace Stage  │
│ Split View, MapLibre, GIS Tools) │  │ (Viewport, Transform, Grid, HUD) │
└──────────────────┬───────────────┘  └──────────────┬───────────────────┘
                   │ "Send to Canvas"                │
                   └────────────────────────────────►│
                                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CANVAS NODE REGISTRY ENGINE                       │
├────────────────┬───────────────┬────────────────┬──────────────────────┤
│ LiveMapItem    │ MapSnapshot   │ ClimateIndex   │ Chart / Meteogram    │
│ (MapLibre WebGL│ (Preserved    │ (Niño, MJO,    │ (Skew-T, Timeseries, │
│ Multi-instance)│ Metadata Card)│ IOD, NAO)      │ Ensemble Plumes)     │
├────────────────┼───────────────┼────────────────┼──────────────────────┤
│ ImageReference │ TextBlockItem │ AnnotationItem │ AnalysisFrameItem    │
│ (Upload/Paste) │ (Markdown)    │ (Arrows, GIS)  │ (Group Sections)     │
└────────────────┴───────────────┴────────────────┴──────────────────────┘
                   ▲                             ▲
                   │                             │
┌──────────────────┴───────────────┐  ┌──────────┴───────────────────────┐
│ Sync Group Manager               │  │ Canvas Document Service          │
│ (Coordinates & Forecast Timestep)│  │ (Autosave, Templates, PNG Export)│
└──────────────────────────────────┘  └──────────────────────────────────┘
```

### Data Model & State Hierarchy

1. **`CanvasDocument`**:
   - `id`: Unique workspace identifier.
   - `name`: e.g. "Hormozgan Convective Outlook - 24h Synoptic Briefing".
   - `items`: Ordered array of `CanvasItem` elements.
   - `viewport`: `{ x: number, y: number, zoom: number }`.
   - `syncGroups`: Record of active sync groups (`{ id: string, name: string, syncCoords: boolean, syncTime: boolean }`).
   - `createdAt` / `updatedAt`: Timestamps.

2. **`CanvasItem` (Polymorphic Node)**:
   - Base properties: `id`, `type`, `x`, `y`, `width`, `height`, `zIndex`, `isLocked`, `groupId`, `frameId`.
   - `live-map`: MapLibre state (`coords`, `zoom`, `activeLayerId`, `model`, `run`, `forecastHour`, `syncGroupId`).
   - `map-snapshot`: Image data URL, source metadata, geographic bounding box, valid timestamp.
   - `climate-index`: Index type (`nino34`, `mjo`, `iod`, `nao`, `soi`), view mode (`value`, `timeseries`, `phase_diagram`), live anomalies.
   - `chart`: Chart type (`sounding`, `meteogram`, `timeseries`), parameter definitions, altitude levels.
   - `image`: URL / base64 source, caption, aspect ratio.
   - `text`: Title, markdown text, typography size (`h1`, `h2`, `body`, `callout`).
   - `annotation`: Geometry type (`arrow`, `front_cold`, `front_warm`, `watch_zone`, `sticky`), color, label.
   - `frame`: Title, background tint, child item IDs.

---

## 5. Implementation Phases & Milestones

1. **Phase 1: Canvas Core Infrastructure**:
   - Implement `/src/types/canvas.ts` data schemas and state actions.
   - Build `/src/components/canvas/AnalysisCanvas.tsx` viewport engine: infinite pan/zoom matrix, coordinate rulers, snap-to-grid, selection marquee, and drag/resize controllers.
   - Integrate the workspace mode switch in `App.tsx` header (`Operational Map` vs `Analysis Canvas`).
2. **Phase 2: Meteorological Node Registry & UI Components**:
   - Embedded interactive `LiveMapItem` with MapLibre GL, controls overlay, and freeze-on-idle.
   - `MapSnapshotItem` with georeferenced metadata badge and "Send to Canvas" action from the operational map.
   - `ClimateIndexItem` supporting Niño 3.4, MJO Wheeler-Hendon phase diagram, IOD, and NAO.
   - `ChartItem` with Skew-T thermodynamic sounding, meteogram curves, and pressure levels.
   - `ImageItem`, `TextItem`, `AnnotationItem` (meteorological arrows/fronts), and `FrameItem`.
3. **Phase 3: Workstation Tools, Sync Engine & Templates**:
   - Canvas top toolbar: Quick Add menu, `/` keyboard shortcut palette, Zoom presets, Align/Distribute tools, Undo/Redo (`Ctrl+Z`, `Ctrl+Y`).
   - Sync Group Manager: Coordinates and forecast valid time synchronization across linked maps.
   - Template System: Pre-loaded **Hormozgan Severe Convective Outlook** template, plus **Model Comparison (ECMWF vs GFS)** and **Synoptic & Teleconnections** presets.
4. **Phase 4: Persistence, Presentation & High-Res Export**:
   - LocalStorage auto-save with dirty state indicators.
   - Fullscreen Presentation Mode for forecaster briefings.
   - High-fidelity PNG export pipeline with canvas raster compositing.
5. **Phase 5: Verification & Quality Assurance**:
   - Comprehensive TypeScript validation (`tsc --noEmit`) and clean Vite compilation.
   - Zero console or WebGL errors.
