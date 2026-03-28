import { HTMLAttributes, forwardRef } from 'react';

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          glass-toolbar
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';

// Toolbar Divider
export const ToolbarDivider = () => (
  <div className="glass-divider-vertical h-6" />
);

// Toolbar Spacer
export const ToolbarSpacer = () => <div className="flex-1" />;
