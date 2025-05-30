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
    <>
      <FolderDrawer
        id={folderDrawerId}
        mainContent={
          <div className="h-screen">
            <ChatInterface
              folderDrawerId={folderDrawerId}
              previewDrawerId={previewDrawerId}
            />
          </div>
        }
      />
      <ResizableDrawer 
        id={previewDrawerId} 
        mainContent={
          <div className="h-screen">
            <ChatInterface
              folderDrawerId={folderDrawerId}
              previewDrawerId={previewDrawerId}
            />
          </div>
        }
      />
    </>
  );
}

export default App;
