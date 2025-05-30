import { CollaborationState } from "../collaborationTypes";

export const CollaborationStateManager = {
  save(state: CollaborationState): void {
    try {
      localStorage.setItem("collaborationState", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save collaboration state to localStorage:", error);
    }
  },

  load(): CollaborationState | null {
    try {
      const savedState = localStorage.getItem("collaborationState");
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error("Failed to load collaboration state from localStorage:", error);
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem("collaborationState");
    } catch (error) {
      console.error("Failed to clear collaboration state from localStorage:", error);
    }
  },
};