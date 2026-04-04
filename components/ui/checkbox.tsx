import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer h-5 w-5 shrink-0 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      checkedVariant: {
        true: 'bg-black border-black text-white',
        false: 'bg-white',
      },
    },
    defaultVariants: {
      checkedVariant: false,
    },
  }
);

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, checked, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(checkboxVariants({ checkedVariant: !!checked }), className)}
      checked={checked}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox }; 