import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-lg shadow-accent/20',
        secondary:
          'bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-hover hover:border-border-strong',
        ghost:
          'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
        destructive:
          'bg-status-error/10 text-status-error border border-status-error/20 hover:bg-status-error/20',
        outline:
          'border border-border-default bg-transparent text-text-primary hover:bg-bg-elevated',
        link:
          'text-accent underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-btn',
        sm:      'h-7 px-3 text-xs rounded-badge',
        lg:      'h-11 px-6 rounded-btn text-base',
        icon:    'h-9 w-9 rounded-btn',
        'icon-sm': 'h-7 w-7 rounded-badge',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
