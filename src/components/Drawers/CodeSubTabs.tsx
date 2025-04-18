import React, { useState } from 'react';
import { FileCode2, FileStack, ScrollText } from 'lucide-react';
import MockupCode from './MockupCode';

const SUB_TABS = [
  {
    id: 'html',
    title: 'HTML',
    icon: <FileCode2 size={14} strokeWidth={'0.75'}/>,
  },
  {
    id: 'css',
    title: 'CSS',
    icon: <FileStack size={14} strokeWidth={'0.75'}/>,
  },
  {
    id: 'js',
    title: 'JavaScript',
    icon: <ScrollText size={14} strokeWidth={'0.75'}/>,
  },
];

const CodeSubTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('html');

  return (
    <section
      className="flex flex-col h-full"
      aria-label="Code Sub Tabs"
      role="region"
      data-component="CodeSubTabs"
    >
      <nav
        role="navigation"
        aria-label="Code Sub Tabs Navigation"
        className="flex-shrink-0 flex tabs"
        data-element="sub-tab-list"
      >
        <div
          role="tablist"
          aria-label="Code file types"
          className="flex w-full"
        >
          {SUB_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const baseTabStyles = "tab h-auto py-2 px-4 flex items-center gap-1.5 transition-colors duration-150 ease-in-out";
            const activeTabStyles = isActive
              ? "tab-active bg-zinc-800 [--tab-border-color:theme(colors.base-300)] border-b-0 rounded-t-lg"
              : "";
            const inactiveTabStyles = !isActive
              ? "text-base-content/60 border-b [--tab-border-color:theme(colors.base-300)]"
              : "";

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`subtab-content-${tab.id}`}
                id={`subtab-label-${tab.id}`}
                className={`${baseTabStyles} ${activeTabStyles} ${inactiveTabStyles}`}
                onClick={() => setActiveTab(tab.id)}
                data-element="sub-tab"
                data-tab-id={tab.id}
              >
                <span className="inline-flex items-center" aria-hidden="true">{tab.icon}</span>
                <span className="text-sm">{tab.title}</span>
              </button>
            );
          })}
          <div
            className="tab grow border-b [--tab-border-color:theme(colors.base-300)]"
            data-element="tab-border"
            aria-hidden="true"
          ></div>
        </div>
      </nav>

      <div
        className="relative flex-grow overflow-hidden bg-zinc-800"
        aria-label="Code Sub Tab Content"
        data-element="sub-tab-content-container"
      >
        {SUB_TABS.map((tab) => (
          <section
            key={tab.id}
            id={`subtab-content-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`subtab-label-${tab.id}`}
            hidden={activeTab !== tab.id}
            className={`absolute inset-0 h-full w-full flex flex-col
              ${activeTab === tab.id ? 'opacity-100 transition-opacity duration-150 ease-in-out' : 'pointer-events-none opacity-0'}
              bg-zinc-800 overflow-auto`}
            data-element="sub-tab-panel"
            data-tab-id={tab.id}
          >
            <div className="p-4 h-full w-full items-center">
              {tab.id === 'html' && (
                <MockupCode
                code={`<!-- No HTML here yet...-->`}
                language="html"
              />
              )}
              {tab.id === 'css' && (
                <MockupCode
                code={`/* No CSS here yet... */`}
                language="css"
              />
              )}
              {tab.id === 'js' && (
              <MockupCode
              code={`// No JavaScript here yet...`}
              language="javascript"
            />
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
};

export default CodeSubTabs;