import React, { useRef, useState } from 'react';
import DrawerHeader from './DrawerHeaders.tsx';
import { EyeIcon } from 'lucide-react';
import TabbedGroup, { TabItem } from './TabbedGroup.tsx';
import { CodeTabIcon, LivePreviewTabIcon, MarkdownTabIcon } from './TabIcons.tsx';
import CodeSubTabs from './CodeSubTabs.tsx';
import MockPreviewWindow from './MockPreviewWindow';

interface DrawerProps {
  id: string;
  mainContent?: React.ReactNode;
  triggerContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

const MIN_WIDTH = 200;
const DEFAULT_WIDTH = 320;

const ResizableDrawer: React.FC<DrawerProps> = ({
  id = "ResizableDrawer",
  mainContent,
  className,
  style,
  zIndex = 100,
}) => {

  const [htmlCode] = useState('<div id="root"></div>');
  const [cssCode] = useState('h1 { color: blue; }');
  const [jsCode] = useState(`
    const App = () => <h1>{undefinedVar.toString()}</h1>;
    ReactDOM.render(<App />, document.getElementById('root'));
  `);

  const [drawerWidth, setDrawerWidth] = useState<number>(DEFAULT_WIDTH);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(DEFAULT_WIDTH);

  const onMouseMove = (moveEvent: MouseEvent) => {
    const newWidth = startWidthRef.current - (moveEvent.clientX - startXRef.current);
    setDrawerWidth(Math.max(newWidth, MIN_WIDTH));
  };

  const onMouseUp = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = drawerWidth;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const previewTabs: TabItem[] = [
    {
      id: 'preview-code',
      title: 'Code',
      icon: <CodeTabIcon size={14} />,
      content: <CodeSubTabs />,
    },
    {
      id: 'preview-live',
      title: 'Live Preview',
      icon: <LivePreviewTabIcon size={14} />,
      content: (
        <MockPreviewWindow
          htmlCode={htmlCode}
          cssCode={cssCode}
          jsCode={jsCode}
        />
      ),
    },
    {
      id: 'preview-markdown',
      title: 'Markdown',
      icon: <MarkdownTabIcon size={14} />,
      content: (
        <div className="text-sm p-2">
          <p>Markdown Content Goes Here...</p>
        </div>
      ),
    },
  ];

  return (
    <aside
      className={`drawer drawer-end${className ? ' ' + className : ''}`}
      style={style}
      data-component="ResizableDrawer"
      aria-label="Preview Drawer"
      role="complementary"
    >
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {mainContent}
      </div>
      <nav
        className="drawer-side"
        style={{ zIndex }}
        aria-label="Preview Drawer Side"
        role="region"
        data-element="drawer-side"
      >
        <label htmlFor={id} aria-label="Close Preview Drawer" className="drawer-overlay" />
        <section
          ref={drawerContentRef}
          className="bg-zinc-800 text-base-content min-h-full h-full p-8 relative flex flex-col"
          style={{ width: `${drawerWidth}px`, minWidth: `${MIN_WIDTH}px` }}
          aria-label="Preview Drawer Content"
          role="region"
          data-element="drawer-content"
        >
          {/* Resize Handle */}
          <div
            className="absolute top-0 left-0 w-2 h-full bg-base-content/30 hover:bg-primary cursor-ew-resize z-10"
            onMouseDown={handleMouseDown}
            title="Resize Drawer"
            aria-label="Resize Drawer"
            role="separator"
            data-element="resize-handle"
          />

          {/* Header Container */}
          <header className="pl-2 flex-shrink-0" aria-label="Drawer Header" role="banner">
            <DrawerHeader icon={<EyeIcon size={20} />} title="Preview Project" />
          </header>

          {/* Tabbed Group Container */}
          <section
            className="pl-2 flex-grow overflow-hidden"
            aria-label="Preview Tabs"
            role="region"
            data-element="tabbed-group-container"
          >
            <TabbedGroup
              tabs={previewTabs}
              groupName="preview-project-tabs"
              defaultTabId="preview-code"
              id="project-preview-tab-group"
              data-testid="project-preview-tab-group"
              className="h-full"
              tabContentClassName="p-2 text-base-content/90"
            />
          </section>
        </section>
      </nav>
    </aside>
  );
};

export default ResizableDrawer;