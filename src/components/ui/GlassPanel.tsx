import { HTMLAttributes, forwardRef } from 'react';

type GlassPanelVariant = 'default' | 'elevated' | 'subtle';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassPanelVariant;
  hover?: boolean;
  as?: 'div' | 'section' | 'article';
}

const variantStyles: Record<GlassPanelVariant, string> = {
  default: 'glass-panel',
  elevated: 'glass-panel-elevated',
  subtle: 'glass-panel-subtle',
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ variant = 'default', hover = false, as = 'div', className = '', children, ...props }, ref) => {
    const Component = as;
    
    const hoverStyles = hover
      ? 'cursor-pointer hover:bg-glass-bg-hover hover:border-glass-border-bright hover:shadow-glass-elevated hover:-translate-y-0.5'
      : '';

    return (
      <Component
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${hoverStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
