import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'glass-button',
  primary: 'glass-button-primary',
  danger: 'glass-button-danger',
  ghost: `
    relative overflow-hidden
    px-4 py-2
    bg-transparent
    border border-transparent
    rounded-glass-sm
    text-apple-label font-medium
    transition-all duration-200 ease-out
    cursor-pointer
    hover:bg-glass-bg hover:border-glass-border
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
