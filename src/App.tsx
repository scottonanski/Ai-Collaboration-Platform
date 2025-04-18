// src/App.tsx
import "./App.css";
import ResizableDrawer from "./components/Drawers/ResizableDrawer.tsx";
import FolderDrawer from "./components/Drawers/FolderDrawer.tsx";
import ChatInterface from "./components/ChatInterface/ChatInterface.tsx"; // Import the new component

function App() {
  // Define IDs for the drawers
  const folderDrawerId = "FolderDrawer";
  const previewDrawerId = "PreviewDrawer";

  // Define content for drawers (could also be moved to separate components)
  const folderSidebar = ["Folder 1", "File A", "File B"];

  return (
    <>
      {/* Drawers remain at the top level for layout */}
      <FolderDrawer
        id={folderDrawerId}
        sidebarItems={folderSidebar}
        triggerContent={null} // Trigger is inside ChatInterface
      />
      <ResizableDrawer
        id={previewDrawerId}
        triggerContent={null} // Trigger is inside ChatInterface
      />

      {/* Render the ChatInterface, passing drawer IDs */}
      {/* Give it height to fill the screen */}
      <div className="h-screen">
         <ChatInterface
            folderDrawerId={folderDrawerId}
            previewDrawerId={previewDrawerId}
         />
      </div>
    </>
  );
}

export default App;
