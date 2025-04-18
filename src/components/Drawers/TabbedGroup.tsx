import React, { useState, useEffect } from "react";


// Define the structure for a single tab item
export interface TabItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

// Props for the TabbedGroup component
interface TabbedGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: TabItem[];
  groupName: string;
  defaultTabId?: string;
  tabListClassName?: string;
  tabContentClassName?: string;
  onTabChange?: (tabId: string) => void;
}

const TabbedGroup: React.FC<TabbedGroupProps> = ({
  tabs,
  groupName,
  defaultTabId,
  className = "",
  tabListClassName = "",
  tabContentClassName = "p-4",
  onTabChange,
  ...rest
}) => {
  const getInitialTabId = () => {
    if (defaultTabId && tabs.some((tab) => tab.id === defaultTabId)) {
      return defaultTabId;
    }
    return tabs[0]?.id;
  };

  const [activeTabId, setActiveTabId] = useState<string | undefined>(
    getInitialTabId()
  );

  useEffect(() => {
    setActiveTabId(getInitialTabId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTabId, tabs]);

  const handleTabClick = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    if (tabId !== activeTabId) {
      setActiveTabId(tabId);
      if (onTabChange) {
        onTabChange(tabId);
      }
    }
  };

  const renderTabs = tabs;

  return (
    <section
      className={`flex flex-col h-full bg-zinc-800 ${className}`}
      data-component="TabbedGroup"
      data-group={groupName}
      aria-label={groupName}
      role="region"
      {...rest}
    >
      {/* Tab List Area */}
      <nav
        role="navigation"
        aria-label={`${groupName} Tabs Navigation`}
        className={`tabs tabs-lifted bg-zinc-800 ${tabListClassName}`}
        data-element="tab-list"
      >
        <div
          role="tablist"
          aria-label={`${groupName} Tabs`}
          className="flex w-full overflow-x-auto flex-nowrap scrollbar-thin scrollbar-thumb-base-content/30"
        >
          {renderTabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const baseTabStyles =
              "tab h-auto py-2 px-4 flex items-center gap-1.5 transition-colors duration-150 ease-in-out bg-zinc-800";
            const activeTabStyles = isActive
              ? "tab-active bg-zinc-800 [--tab-border-color:theme(colors.base-300)] border-b-0 rounded-t-lg"
              : "";
            const inactiveTabStyles = !isActive
              ? "text-base-content/60 border-b [--tab-border-color:theme(colors.base-300)]"
              : "";

            return (
              <a
                key={tab.id}
                id={`tab-label-${groupName}-${tab.id}`}
                role="tab"
                href="#"
                className={`${baseTabStyles} ${activeTabStyles} ${inactiveTabStyles}`}
                aria-selected={isActive}
                aria-controls={`tab-content-${groupName}-${tab.id}`}
                onClick={(e) => handleTabClick(e, tab.id)}
                data-element="tab"
                data-tab-id={tab.id}
              >
                {tab.icon && (
                  <span className="inline-flex items-center">{tab.icon}</span>
                )}
                <span>{tab.title}</span>
              </a>
            );
          })}
          {/* Dummy tab element for the bottom border line */}
          <a
            className="tab grow border-b [--tab-border-color:theme(colors.base-300)] bg-zinc-800"
            data-element="tab-border"
            tabIndex={-1}
            aria-hidden="true"
          ></a>
        </div>
      </nav>

      {/* Content Area Container */}
      <main
        className="relative flex-grow overflow-hidden bg-zinc-800"
        data-element="tab-content-container"
        aria-label={`${groupName} Tab Content`}
        role="main"
      >
        {renderTabs.map((tab) => (
          <section
  key={tab.id}
  id={`tab-content-${groupName}-${tab.id}`}
  role="tabpanel"
  className={`tab-content flex flex-col h-full w-full
    ${
      activeTabId === tab.id
        ? "opacity-100 transition-opacity duration-150 ease-in-out"
        : "opacity-0 pointer-events-none"
    }
    ${tabContentClassName} overflow-auto bg-zinc-800`}
  aria-labelledby={`tab-label-${groupName}-${tab.id}`}
  hidden={activeTabId !== tab.id}
  data-element="tab-panel"
  data-tab-id={tab.id}
>
  {tab.content}
</section>
        ))}
      </main>
    </section>
  );
};

export default TabbedGroup;