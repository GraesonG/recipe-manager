import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = true, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          glass-panel
          p-5
          transition-all duration-300 ease-out
          ${hoverable ? 'cursor-pointer hover:bg-glass-bg-hover hover:border-glass-border-bright hover:shadow-glass-elevated hover:-translate-y-0.5' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
