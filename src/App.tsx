// src/App.tsx
import "./App.css";
import ResizableDrawer from "./components/Drawers/ResizableDrawer.tsx";
import FolderDrawer from "./components/Drawers/FolderDrawer.tsx";
import ChatInterface from "./components/ChatInterface/ChatInterface.tsx";
import React from "react";

function App() {
  const folderDrawerId = "FolderDrawer";
  const previewDrawerId = "PreviewDrawer";

  return (
    <div className="min-h-screen bg-base-200">
      {/* Main Chat Interface */}
      <div className="h-screen">
        <ChatInterface
          folderDrawerId={folderDrawerId}
          previewDrawerId={previewDrawerId}
        />
      </div>

      {/* Left Drawer - File System */}
      <FolderDrawer
        id={folderDrawerId}
        mainContent={<div></div>} // Empty div as drawers handle their own content
      />

      {/* Right Drawer - Preview & Tools */}
      <ResizableDrawer 
        id={previewDrawerId} 
        mainContent={<div></div>} // Empty div as drawers handle their own content
      />
    </div>
  );
}

export default App;
