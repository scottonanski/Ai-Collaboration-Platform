import React from 'react';

interface DrawerHeaderProps {
  icon: React.ReactNode; // Expecting an icon component like <Folder /> or <EyeIcon />
  title: string;
  className?: string; // Optional additional classes
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ icon, title, className = '' }) => {
  return (
    <header
      className={`flex items-center gap-2 p-2 border-b border-base-content/20 mb-4 ${className}`}
      aria-label="Drawer Header"
      role="banner"
      data-component="DrawerHeader"
    >
      <span className="text-base-content/80" aria-hidden="true">{icon}</span>
      <h2 className="text-lg font-semibold text-base-content">{title}</h2>
    </header>
  );
};

export default DrawerHeader;