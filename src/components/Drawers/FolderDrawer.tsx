import React from 'react';
import DrawerHeader from './DrawerHeaders.tsx';
import { Folder } from 'lucide-react';

interface FolderDrawerProps {
  id: string;
  sidebarItems: string[];
  mainContent?: React.ReactNode;
  triggerContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

const FolderDrawer: React.FC<FolderDrawerProps> = ({
  id = "FolderDrawer",
  mainContent,
  className,
  style,
  zIndex = 100,
  sidebarItems,
}) => {
  return (
    <aside
      className={`drawer drawer-start${className ? ' ' + className : ''}`}
      style={style}
      aria-label="Project Files Drawer"
      role="complementary"
      data-component="FolderDrawer"
    >
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {mainContent}
      </div>
      <nav
        className="drawer-side"
        style={{ zIndex }}
        aria-label="Project Files Sidebar"
        role="region"
        data-element="drawer-side"
      >
        <label
          htmlFor={id}
          aria-label="Close Project Files Sidebar"
          className="drawer-overlay"
        />
        <section
          className="menu bg-zinc-800 min-h-full w-80 p-4 pt-8"
          aria-label="Project Files List"
          role="region"
          data-element="sidebar-content"
        >
          <DrawerHeader icon={<Folder size={16} color='white' strokeWidth="0.75"/>} title="Project Files"/>
          <ul>
            {sidebarItems.map((item, index) => (
              <li key={index}><a>{item}</a></li>
            ))}
          </ul>
        </section>
      </nav>
    </aside>
  );
};

export default FolderDrawer;