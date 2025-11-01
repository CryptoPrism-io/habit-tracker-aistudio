import React, { useState } from 'react';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card-strong">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded px-2 py-1 transition-colors hover:bg-slate-50/20 dark:hover:bg-white/10"
        aria-expanded={isOpen}
        aria-label={`Toggle ${title} section`}
      >
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 opacity-90">
          {title}
        </h3>
        <span className="text-slate-600 dark:text-slate-300 transition-transform duration-200 opacity-75" style={{
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
        }}>
          ▼
        </span>
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? '2000px' : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleCard;
