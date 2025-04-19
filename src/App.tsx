// src/App.tsx
import "./App.css";
import ResizableDrawer from "./components/Drawers/ResizableDrawer.tsx";
import FolderDrawer from "./components/Drawers/FolderDrawer.tsx";
import ChatInterface from "./components/ChatInterface/ChatInterface.tsx";

function App() {
  const folderDrawerId = "FolderDrawer";
  const previewDrawerId = "PreviewDrawer";

  const folderSidebar = ["Folder 1", "File A", "File B"];

  return (
    <>
      <FolderDrawer
        id={folderDrawerId}
        sidebarItems={folderSidebar}
        triggerContent={null}
      />
      <ResizableDrawer id={previewDrawerId} triggerContent={null} />

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
