import { CanvasDocument } from "../../types/canvas";
import { HORMOZGAN_CONVECTIVE_OUTLOOK_TEMPLATE } from "../../data/canvasTemplates";

export interface CanvasDocumentMetadata {
  id: string;
  name: string;
  updatedAt: number;
  itemCount: number;
}

export interface ICanvasRepository {
  loadDocument(id?: string): Promise<CanvasDocument>;
  saveDocument(doc: CanvasDocument): Promise<void>;
  listDocuments?(): Promise<CanvasDocumentMetadata[]>;
  resetToTemplate?(template: CanvasDocument): Promise<CanvasDocument>;
}

const STORAGE_PREFIX = "alpha_meteo_canvas_doc_v1";

export class LocalStorageCanvasRepository implements ICanvasRepository {
  private activeKey: string;

  constructor(keySuffix: string = "primary") {
    this.activeKey = `${STORAGE_PREFIX}_${keySuffix}`;
  }

  public async loadDocument(id?: string): Promise<CanvasDocument> {
    const key = id ? `${STORAGE_PREFIX}_${id}` : this.activeKey;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.items)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("[CanvasRepository] Could not load document from localStorage:", e);
    }
    // Default fallback
    return HORMOZGAN_CONVECTIVE_OUTLOOK_TEMPLATE;
  }

  public async saveDocument(doc: CanvasDocument): Promise<void> {
    const key = doc.id ? `${STORAGE_PREFIX}_${doc.id}` : this.activeKey;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(doc));
        // Also keep primary in sync if it's the active workspace
        window.localStorage.setItem(this.activeKey, JSON.stringify(doc));
      }
    } catch (e) {
      console.error("[CanvasRepository] Autosave to localStorage failed:", e);
    }
  }

  public async resetToTemplate(template: CanvasDocument): Promise<CanvasDocument> {
    await this.saveDocument(template);
    return template;
  }
}

export const defaultCanvasRepository: ICanvasRepository = new LocalStorageCanvasRepository();
