import React, { useRef, useState } from "react";

const PreviewDrawer: React.FC<{ onPreviewDrawerChange: (isOpen: boolean) => void }> = ({ onPreviewDrawerChange }) => {
  const [drawerWidth] = useState<number>(384);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="tooltip tooltip-top"
      data-tip="Preview"
      aria-label="Preview Drawer Tooltip"
      role="region"
      data-component="PreviewDrawer"
    >
      <aside className="drawer drawer-end" aria-label="Preview Drawer" role="complementary">
        <input
          id="preview-drawer"
          type="checkbox"
          className="drawer-toggle"
          onChange={(e) => onPreviewDrawerChange(e.target.checked)}
          aria-label="Toggle Preview Drawer"
        />
        <nav
          className="drawer-side z-100"
          aria-label="Preview Drawer Side"
          role="region"
        >
          <label htmlFor="preview-drawer" className="drawer-overlay" aria-label="Close Preview Drawer" />
          <section
            ref={drawerContentRef}
            className="menu bg-base-200 min-h-full p-4 relative"
            style={{ width: `${drawerWidth}px`, minWidth: "25%" }}
            aria-label="Preview Drawer Content"
            role="region"
          >
            {/* Drawer content goes here */}
          </section>
        </nav>
      </aside>
    </section>
  );
};

export default PreviewDrawer;