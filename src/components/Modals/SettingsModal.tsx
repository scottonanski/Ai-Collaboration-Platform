import React, { ReactNode } from 'react';

// Define props for the modal component
interface SettingsModalProps {
  /** A unique ID required to open/close the modal programmatically. */
  id: string;
  /** The title displayed at the top of the modal. */
  title: string;
  /** The main content to display within the modal body. */
  children: ReactNode;
  /** Optional additional CSS classes for the <dialog> element. */
  className?: string;
  /** Optional additional CSS classes for the div.modal-box element. */
  boxClassName?: string;
  /** Optional inline styles for the <dialog> element */
  style?: React.CSSProperties;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  id,
  title,
  children,
  className = '',
  boxClassName = '',
  style
}) => {
  // Combine the passed-in style with position: fixed
  const modalStyle: React.CSSProperties = {
    ...style,
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    margin: 'auto',
    zIndex: 1000,
  };

  return (
    <dialog
      id={id}
      className={`modal ${className}`}
      style={modalStyle}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-label={title}
      role="dialog"
      data-component="SettingsModal"
    >
      <div className={`modal-box ${boxClassName}`} role="document">
        {/* Form with method="dialog" allows the button inside to close the modal */}
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" aria-label="Close Modal">✕</button>
        </form>
        {/* Modal Title */}
        <h3 id={`${id}-title`} className="font-bold text-lg">{title}</h3>
        {/* Modal Content */}
        <section className="py-4" aria-label="Modal Content" role="region">
          {children}
        </section>
      </div>
    </dialog>
  );
};

export default SettingsModal;