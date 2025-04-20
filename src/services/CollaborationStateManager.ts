import { CollaborationState } from "../collaborationTypes";

export class CollaborationStateManager {
  private static STORAGE_KEY = "collaborationState";

  static save(state: CollaborationState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save collaboration state:", error);
    }
  }

  static load(): CollaborationState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load collaboration state:", error);
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}