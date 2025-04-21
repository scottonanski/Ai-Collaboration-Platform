### Getting Started with the Project

To get started with the project, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/scottonanski/collaboration.git
    cd collaboration
    ```
2.  **Switch to the Feature Branch:** (Note: This branch name is assumed from the previous README)
    ```bash
    git checkout scott/feature/react-18-downgrade
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, and you can view the app in your browser (typically at `http://localhost:5173`).

---

### Comprehensive Review of the Codebase (Verified Against Provided Files)

#### Overview of the App

The codebase represents a React-based web application designed to facilitate and observe collaboration between two AI workers (powered by Ollama models). The primary goals are to process user inputs, maintain a conversation history (working memory), generate summaries (strategic memory), and allow user interaction and control over the process. The app features a central chat interface, drawers for settings, file management (using placeholder data), and code/live previews (partially functional, using placeholder/static content). It utilizes Tailwind CSS and DaisyUI for styling, React with TypeScript for the frontend logic, and integrates with a local Ollama server for AI model inference.

#### Core Functionality Detailed

1.  **Chat Interface (`ChatInterface.tsx`)**:
    *   Serves as the main application component, orchestrating the user experience and interaction with the `CollaborationService`.
    *   Manages the display of the application state received from `CollaborationService`, tracking working memory (recent messages) and strategic memory (summaries) within `CollaborationState`.
    *   Handles user input for initiating collaboration and injecting messages during pauses.
    *   Provides UI controls for pausing/resuming the collaboration, opening the settings drawer (`SettingsDrawer`), and toggling side drawers for file management (`FolderDrawer`) and previews (`ResizableDrawer`).
    *   Displays status information, such as Ollama connection status (`ollamaStatus` state) and the current phase of the collaboration (`statusMessage` derived state).
    *   Loads and potentially triggers saving of state via `CollaborationStateManager` from the `utils` directory.

2.  **Collaboration Logic (`CollaborationService.tsx`)**:
    *   Acts as the engine for the AI collaboration, managing turns, model selection, and memory state internally.
    *   Executes the turn-based collaboration loop: alternates between workers, constructs context from working memory, calls the Ollama API via `fetchOllamaResponse`, and updates the application state via the `updateCallback`.
    *   Includes a mechanism (`checkMemoryLimit`, `compressMemory`) to compress working memory into strategic memory chunks when it exceeds a threshold (10 messages). *Note: The current compression logic is very basic (string concatenation and truncation).*
    *   Implements functionalities for pausing (`shouldPause` flag), resuming (`shouldResume` flag), and injecting user messages (`injectMessage` method) into a paused collaboration.

3.  **Ollama Integration (`ollamaServices.tsx`)**:
    *   Provides functions to interact with a local Ollama server (hardcoded URL: `http://localhost:11434`).
    *   Includes `checkOllamaConnection` to verify server availability, `fetchOllamaModels` to list available models, and `fetchOllamaResponse` to send prompts/context and receive generated text.
    *   `fetchOllamaResponse` incorporates basic retry logic for API calls.

4.  **Drawers and Previews**:
    *   **Folder Drawer (`FolderDrawer.tsx`)**: Displays a project file structure using `FileTree.tsx` and `FileTreeNode.tsx`. **Crucially, it currently uses static `placeholderTreeData` and is not connected to any real file system.** The `sidebarItems` prop passed in `App.tsx` is not declared or used in `FolderDrawer.tsx`.
    *   **Resizable Drawer (`ResizableDrawer.tsx`)**: A multi-purpose preview panel toggled by the `ScanEye` icon's `label` in `ChatInterface`. It contains:
        *   **Code Tab (`CodeSubTabs.tsx`)**: Displays tabs for HTML, CSS, and JS, but **renders static placeholder code** (`<!-- No HTML here yet... -->`, etc.) within `MockupCode` components. It is not connected to the file tree or AI output.
        *   **Live Preview (`LivePreview.tsx`)**: Aims to render HTML/CSS/JS code interactively in an iframe. **It currently ignores the `htmlCode`, `cssCode`, `jsCode` props passed to it.** Instead, its internal `updatePreview` function generates `srcDoc` based on hardcoded HTML, CSS, and a particle animation JavaScript demo. `ResizableDrawer` passes example React code in its *own* state to these props, but `LivePreview` does not use them. Initializes `esbuild-wasm`.
        *   **Markdown Tab (`MarkdownRenderer.tsx`)**: Correctly displays the contents of the strategic memory (passed via the `strategicMemory` prop from `ChatInterface` to `ResizableDrawer`), formatted as Markdown.

5.  **Settings (`SettingsDrawer.tsx` and `CollaborationSettings.tsx`)**:
    *   Provides a modal/drawer interface for users to configure the collaboration parameters.
    *   Allows setting names, models, API providers (Ollama/OpenAI options shown, but only Ollama fetch is implemented), and API keys (password fields) for both `worker1` and `worker2`.
    *   Includes inputs for the number of collaboration turns and toggles for features like summary requests and resuming collaboration after user injection. A `summaryModel` can also be selected if `requestSummary` is true.
    *   Utilizes `ApiKeyForm.tsx` and `WorkerForm.tsx` as sub-components.

6.  **Memory Management (`MemoryController.ts`)**:
    *   Contains static utility functions: `getContext` for formatting context strings (using strategic and recent working memory) and `compress` for the basic (non-LLM) memory compression logic used by `CollaborationService`.

7.  **State Persistence (`utils/CollaborationStateManager.ts`)**:
    *   Provides simple object-based functions (`save`, `load`, `clear`) for interacting with `localStorage` under the key `"collaborationState"`. Used by `ChatInterface` during mount/initialization. *Note: A duplicate class-based file exists at `src/services/CollaborationStateManager.ts` which seems unused based on imports.*

8.  **UI Components**:
    *   **Chat Messages (`ChatMessage.tsx`)**: Renders individual messages in the chat history. **Uses `dangerouslySetInnerHTML` with inadequate string replacement (`.replace(/</g, "&lt;")`) for sanitization, posing a security risk if LLMs output HTML/script tags.**
    *   **`ChatBubbles.tsx`**: Exists but appears unused in the main `ChatInterface` flow.
    *   **`Button.tsx`**, **`LLMStatusIndicator.tsx`**, **`TabbedGroup.tsx`**: Reusable UI components functioning as described.
    *   **`FileTreeNode.tsx`**: Displays individual file/folder nodes with appropriate icons, handling nesting and expand/collapse state for folders.

#### Current State Assessment (Verified)

*   **What Works**:
    *   Core chat loop: Initiation, turn-based AI responses via Ollama, display in `ChatInterface`.
    *   Pause, Resume, Inject Message functionalities in `CollaborationService` are implemented.
    *   Settings Drawer: Configuration of workers, turns, models, summary options is possible and reflected in `ChatInterface` state.
    *   Ollama connection check and model fetching.
    *   Basic state persistence to `localStorage` via `utils/CollaborationStateManager`.
    *   Drawers (`FolderDrawer`, `ResizableDrawer`) toggle correctly.
    *   Markdown rendering of (basic) strategic memory in the preview drawer.
    *   Input disabling/placeholder changes based on Ollama status and collaboration state.

*   **What Needs Improvement / Confirmed Issues**:
    *   **Live Preview (`LivePreview.tsx`) is not functional:** It displays a hardcoded demo, completely ignoring the `htmlCode`, `cssCode`, `jsCode` props intended to provide dynamic content.
    *   **Code Tabs (`CodeSubTabs.tsx`) show only placeholders:** Not connected to any dynamic code source (file system or AI output).
    *   **File Tree (`FolderDrawer.tsx`, `FileTree.tsx`) is static:** Uses hardcoded `placeholderTreeData`, no real file system interaction.
    *   **Memory Compression is rudimentary:** The `compressMemory` logic does not perform actual summarization, only basic string joining/truncation.
    *   **HTML Sanitization (`ChatMessage.tsx`) is unsafe:** Using `dangerouslySetInnerHTML` with simple string replacement is insecure.
    *   **`CollaborationStateManager` Duplication:** Two files (`utils/` and `services/`) exist for state management, only the `utils` version appears imported by `ChatInterface`. This is confusing and potentially problematic.
    *   **Hardcoded Ollama URL:** Found in `ollamaServices.tsx`.
    *   **Unused Code:** `ChatBubbles.tsx` seems unused by `ChatInterface`. The `sidebarItems` prop in `App.tsx` is unused by `FolderDrawer`. `StrategicMemoryChunkComponent.tsx` exists but isn't used in the main chat log rendering loop of `ChatInterface`.

#### Possible Avenues for Future Development (Remain Valid)

1.  **Fix & Enhance Previews**: *Priority 1:* Fix `LivePreview.tsx` to render dynamic content from props. Connect `CodeSubTabs.tsx` to a file source.
2.  **Implement File System Integration**: Connect `FolderDrawer` to a real or virtual file system.
3.  **Improve Memory Summarization**: Implement LLM-based summarization.
4.  **Refine Collaboration Features**: Explore collaborative editing, AI code review, etc.
5.  **UI/UX Polish**: Loading indicators, error display improvements, accessibility audit.
6.  **Robustness & Stability**: Consolidate `CollaborationStateManager`, improve error handling, **fix sanitization**, expand test coverage.
7.  **Advanced Features**: Tool use, streaming responses, multi-user support.
8.  **Performance**: Standard React optimizations (`memo`, `useCallback`, etc.).

---

### Addressing AI Development Challenges (Crucial Context - Remains Valid)

The previous report's emphasis on the challenges of using AI for development and the imperative rules to prevent breaking changes remains highly relevant and crucial for this project's stability. Key points reinforced:

*   **No Unsolicited Fundamental Changes.**
*   **Explicit Instructions & Constraints.**
*   **Incremental Implementation.**
*   **Mandatory Human Review.**
*   **Leverage Version Control.**
*   **Prioritize Testing.**
*   **Reject Assumptions.**

**Adherence to these principles is critical.**

---

### Immediate Next Steps (Revised based on Verified Code & README)

1.  **Fix Live Preview Rendering (Highest Priority)**:
    *   Modify the `updatePreview` function within `LivePreview.tsx` to construct the `srcDoc` using the `htmlCode`, `cssCode`, and `jsCode` props it receives from `ResizableDrawer`, instead of its internal hardcoded values. Add basic error handling within the generated script tag. (See previous report's code snippet for a starting point).
2.  **Fix Sanitization Issue (Security Risk)**:
    *   Modify `ChatMessage.tsx`. **Remove `dangerouslySetInnerHTML`**. Render `message.message` as plain text directly within the `div.chat-bubble`. If HTML rendering is *truly* required later, implement `DOMPurify` correctly. For now, prioritize security by rendering as text.
        ```tsx
        // In ChatMessage.tsx - REPLACE the dangerouslySetInnerHTML div with:
        <div className="chat-bubble">
          {/* Render as plain text for safety */}
          {message.message}
        </div>
        ```
3.  **Consolidate State Manager**:
    *   Decide whether to use the `utils` object or the `services` class version of `CollaborationStateManager`.
    *   Delete the unused version.
    *   Ensure `ChatInterface` imports and uses the chosen version correctly.
    *   Consider if `CollaborationService` should handle its own state persistence internally.
4.  **Plan File Tree Integration**:
    *   Design the state management approach (Context or library) to connect file selections in `FileTreeNode` to content display in `CodeSubTabs`. *Do not implement yet, focus on planning.*
5.  **Plan LLM-Based Summarization**:
    *   Refine the conceptual code for `generateSummary`. Plan how the `summaryModel` will be selected/passed. Confirm async handling in `CollaborationService`. *Do not implement yet, focus on planning.*

---

### Conclusion (Verified)

The application has a working core for AI collaboration via Ollama but suffers from significant issues in its preview/file features (static/hardcoded data, non-functional live preview) and a critical security flaw in message rendering. The immediate focus should be on fixing the live preview rendering and the unsafe sanitization. Consolidating the duplicated state manager is also important. Addressing these issues will create a more stable and secure platform before tackling the more complex features like file system integration and proper memory summarization. The strict guidelines for managing AI development assistance remain paramount.