import React, { ElementType, forwardRef, ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';

// 1. Define the props that Button itself will accept.
interface ButtonOwnProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// 2. Define a generic ref type for polymorphism.
type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>['ref'];

// 3. Define props for the inner component that will be wrapped by forwardRef.
type ButtonInnerProps<C extends ElementType> = ButtonOwnProps & {
  as?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof ButtonOwnProps | 'as'>;

// 4. Define props for the public-facing component that consumers will use.
type ButtonPublicProps<C extends ElementType> = ButtonOwnProps & {
  as?: C;
} & Omit<ComponentPropsWithRef<C>, keyof ButtonOwnProps | 'as'>;

const ButtonInner = (props: any, ref: any) => {
  const {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    fullWidth = false,
    as,
    ...rest
  } = props as ButtonInnerProps<any>;
  const Component = as || 'button';

  const baseStyles = `
    font-medium rounded-neumorphic 
    focus:outline-none 
    transition-all duration-200 ease-in-out 
    flex items-center justify-center
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:shadow-none
    no-underline
  `;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  };

  const variantStyles = {
    primary: `
      bg-brand-accent 
      text-white dark:text-dark-text-primary
      shadow-lg hover:shadow-xl hover:bg-light-accent-hover dark:hover:bg-dark-accent-hover
      active:shadow-md
      focus:ring-2 focus:ring-brand-accent/50
      [&_span.material-symbols-rounded]:text-white
    `,
    secondary: `
      bg-light-surface/70 dark:bg-dark-surface/70
      text-light-text-primary dark:text-dark-text-primary
      border border-light-shadow-light/30 dark:border-dark-shadow-light/30
      shadow-lg hover:shadow-xl
      hover:bg-light-surface/80 dark:hover:bg-dark-surface/80
      active:bg-light-surface/90 dark:active:bg-dark-surface/90
      focus:ring-2 focus:ring-brand-accent/30
    `,
    danger: `
      bg-light-danger dark:bg-dark-danger 
      text-white dark:text-dark-text-primary
      shadow-lg hover:shadow-xl
      active:shadow-md
      focus:ring-2 focus:ring-light-danger/50 dark:focus:ring-dark-danger/50
    `,
    ghost: `
      bg-transparent 
      text-light-text-secondary dark:text-dark-text-secondary
      hover:bg-black/5 dark:hover:bg-white/5
      active:bg-black/10 dark:active:bg-white/10
      hover:text-brand-accent dark:hover:text-brand-accent
      focus:ring-1 focus:ring-brand-accent/30
    `
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';

  const finalClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`.replace(/\s+/g, ' ').trim();

  return (
    <Component
      className={finalClassName}
      ref={ref}
      // Set type="button" only for button elements to avoid passing it to other components like Link
  {...(Component === 'button' && { type: 'button' })}
  {...rest}
    >
      {children}
    </Component>
  );
};

// 5. Define the type for the final component after applying forwardRef.
interface ButtonComponent {
  <C extends ElementType = 'button'>(
    props: ButtonPublicProps<C>
  ): React.ReactElement | null;
  displayName?: string;
}

// Use explicit any generics to avoid complex inference issues for polymorphic forwardRef
const Button = forwardRef<any, any>(ButtonInner) as ButtonComponent;

Button.displayName = 'Button';

export default Button;