# Collaboration Project

## Getting Started with the Project

To get started with the project, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/scottonanski/collaboration.git
   cd collaboration
   ```

2. **Ensure You’re on the Main Branch:**

   ```bash
   git checkout main
   ```

   The `main` branch contains the latest stable version of the project, including the core chat loop, Ollama integration, settings drawer, and UI components. Recent updates include improved state persistence, Markdown rendering of strategic memory, and security fixes in `ChatMessage.tsx`.

3. **Install Dependencies:**

   ```bash
   npm install
   ```

4. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   This will start the Vite development server, and you can view the app in your browser (typically at `http://localhost:5173`).

---

Okay, here is a new `README.md` formatted as an executive summary, reflecting the current state based on the codebase provided and outlining the next steps.

---

# README.md

## Project Collaboration: Status & Roadmap

**Date:** April 25, 2024

### 1. Current Status

This project provides a functional platform for observing and interacting with a turn-based collaboration between two AI workers powered by a local Ollama instance. Key features currently implemented include:

*   **Core Collaboration Loop:** Turn-based interaction between configurable AI workers.
*   **Ollama Integration:** Connection checking, model fetching, and **streaming response generation** (`ollamaServices.stream.tsx`).
*   **Chat Interface (`ChatInterface.tsx`):** Displays conversation history, handles user input, and provides controls for pause/resume.
*   **Streaming UI (`ChatMessage.tsx`):** Assistant messages now render incrementally with a visual blinking cursor indicator during generation.
*   **Settings Management (`SettingsDrawer`, `CollaborationSettings`):** Allows configuration of worker names, models, API details, turns, and other parameters.
*   **State Management Foundation (`collaborationStore.ts`):** A Zustand store has been created with appropriate state slices (`messages`, `control`, `connectionStatus`, `settings`) and actions.
*   **Basic State Persistence (`utils/CollaborationStateManager.ts`):** Saves and loads application state to/from `localStorage`.
*   **UI Components:** Drawers for Settings, Files (static), and Previews (static/non-functional) are present and toggle correctly. Uses TailwindCSS/DaisyUI.

### 2. Critical Issues & Limitations

Despite progress, several critical issues and limitations need immediate attention:

1.  **Double-Submit Bug (High Priority):** User reports indicate messages might still be processed twice on submission, despite preventative measures (`isSending`, `submissionLock`). Requires urgent debugging.
2.  **Incomplete Zustand Integration:** While the store exists, `ChatInterface` still manages significant local state (settings, models), and `CollaborationService` requires adaptation to interact directly and efficiently with the store actions instead of its current callback mechanism.
3.  **Non-Functional Previews:**
    *   **Live Preview (`LivePreview.tsx`):** Ignores incoming code props and displays a hardcoded demo.
    *   **Code Tabs (`CodeSubTabs.tsx`):** Show only static placeholder code.
4.  **Static File Tree (`FolderDrawer.tsx`):** Uses placeholder data and is not connected to any dynamic content source.
5.  **Rudimentary Memory Compression (`MemoryController.ts`):** The existing `compressMemory` logic is basic string truncation and not LLM-based summarization (though the UI allows configuring a summary model).
6.  **Duplicate Code:** Two `WorkerForm.tsx` components and two `CollaborationStateManager` files exist, causing confusion.

### 3. Recommended Roadmap & Next Steps

To stabilize the application and deliver core functionality, the following prioritized steps are recommended:

**Phase 1: Stability & Core Integration (Immediate Focus)**

1.  **Debug & Fix Double-Submit:** Add detailed logging in `ChatInterface` (`handleSubmit`) and `CollaborationService` (`startCollaboration`, `injectMessage`) to trace the event flow and resolve the duplicate processing definitively.
2.  **Complete Zustand Integration:**
    *   Modify `CollaborationService` constructor/methods to accept and call specific Zustand store actions (`addMessage`, `updateMessage`, `setControl`). Remove the adapter callback.
    *   Refactor `ChatInterface` to primarily read state from the store and use local state only for transient UI concerns (like the message input value). Move settings configuration state into the Zustand store's `settings` slice.
3.  **Fix Live Preview:** Update `LivePreview.tsx`'s `updatePreview` function to use the `htmlCode`, `cssCode`, `jsCode` props to render dynamic content passed from `ResizableDrawer`.

**Phase 2: Functionality & Cleanup**

4.  **Implement LLM Summarization:** Replace the basic `compressMemory` logic in `CollaborationService` (or potentially a new `MemoryService`) with calls to an LLM (using the configured `summaryModel`) to generate meaningful strategic memory summaries. (*Note: This was previously marked as highest priority by user, moved slightly later to prioritize stability/integration first*).
5.  **Consolidate Duplicates:** Remove the unused `WorkerForm.tsx` and `CollaborationStateManager.ts` files.
6.  **Connect Code Tabs:** Plan and implement logic to connect the `CodeSubTabs` display to a data source (potentially linked to future file tree integration or AI output).

**Phase 3: Enhancements & Quality**

7.  **Implement File Tree Integration:** Connect `FolderDrawer` to a real or virtual file system state.
8.  **Add Automated Tests:** Introduce unit tests (Vitest) for services, utilities, and critical store logic. Add component tests for UI interactions.
9.  **UI/UX Polish:** Improve loading states, error messages, accessibility, and overall visual consistency.
10. **Performance Optimization:** Implement chat memory limits/virtualization and optimize component rendering.

### 4. Conclusion

The project has successfully implemented core AI collaboration and streaming output. The immediate priority is to resolve the double-submit bug and complete the integration with the Zustand state store for enhanced stability and maintainability. Fixing the non-functional preview panes is the next crucial step to delivering the intended user experience. Following this stabilization phase, implementing LLM-based summarization and integrating the file system will significantly enhance the application's capabilities.

---
