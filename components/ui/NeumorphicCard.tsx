
import React, { ElementType, forwardRef, ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// 1. Own props of the NeumorphicCard (specific to it, excluding 'as' and 'ref')
export interface NeumorphicCardOwnProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  pressed?: boolean;
  glassVariant?: boolean;
  transparencyLevel?: 'default' | 'high';
  style?: React.CSSProperties;
}

// 2. Type for the 'ref' based on the component type C
type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>['ref'];

// 3. Props for the inner component function (passed by forwardRef)
// These are OwnProps + 'as' + (props of C without ref, excluding own props and 'as')
type NeumorphicCardInnerProps<C extends ElementType> = NeumorphicCardOwnProps & {
  as?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof NeumorphicCardOwnProps | 'as'>;

// 4. Props for the public component (what the user of <NeumorphicCard /> types)
// These are OwnProps + 'as' + (props of C with ref, excluding own props and 'as')
// This defines what props the consumer of NeumorphicCard can pass, including 'as' and 'ref'.
type NeumorphicCardPublicProps<C extends ElementType> = NeumorphicCardOwnProps & {
  as?: C;
} & Omit<ComponentPropsWithRef<C>, keyof NeumorphicCardOwnProps | 'as'>;


// The inner component implementation
const NeumorphicCardInner = (props: any, ref: any) => {
  const {
    as,
    children,
    className: propClassName = '',
    interactive = false,
    pressed = false,
    glassVariant = false,
    transparencyLevel = 'default',
    style: userStyle,
    ...restHtmlProps
  } = props as NeumorphicCardInnerProps<any>;
  const Component = as || 'div';
  const { theme } = useTheme();

  let baseStyles = `
    p-3 sm:p-4
    rounded-neumorphic-lg
    transition-all duration-300 ease-in-out
    font-light
  `;

  let shadowStyles;
  let backgroundStyles;
  let borderStyles = '';
  let glassInlineStyles: React.CSSProperties = {};

  if (glassVariant) {
    if (transparencyLevel === 'high') {
      if (pressed) {
        backgroundStyles = theme === 'dark' ? 'bg-dark-surface/50' : 'bg-white/50';
        borderStyles = theme === 'dark' ? 'border border-dark-shadow-light/30' : 'border border-light-shadow-light/30';
      } else {
        backgroundStyles = theme === 'dark' ? 'bg-dark-surface/40' : 'bg-white/40';
        borderStyles = theme === 'dark' ? 'border border-dark-shadow-light/20' : 'border border-light-shadow-light/20';
      }
    } else { // Default transparency
      if (pressed) {
        backgroundStyles = theme === 'dark' ? 'bg-dark-surface/80' : 'bg-light-surface/80';
        borderStyles = theme === 'dark' ? 'border border-dark-shadow-light/50' : 'border border-light-shadow-light/50';
      } else {
        backgroundStyles = theme === 'dark' ? 'bg-dark-surface/70' : 'bg-light-surface/70';
        borderStyles = theme === 'dark' ? 'border border-dark-shadow-light/30' : 'border border-light-shadow-light/30';
      }
    }

    if (pressed) {
        shadowStyles = theme === 'dark' ? 'shadow-xl' : 'shadow-lg';
    } else {
        shadowStyles = theme === 'dark' ? 'shadow-2xl' : 'shadow-xl';
    }
    
    glassInlineStyles = { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' };
    baseStyles += ` ${backgroundStyles} ${borderStyles}`;
  } else {
    backgroundStyles = 'bg-light-surface dark:bg-dark-surface';
    shadowStyles = pressed
      ? 'shadow-neumorphic-pressed-light dark:shadow-neumorphic-pressed-dark'
      : 'shadow-neumorphic-convex-light dark:shadow-neumorphic-convex-dark';
    baseStyles += ` ${backgroundStyles}`;
  }

  const interactiveStyles = interactive && !glassVariant
    ? 'hover:shadow-neumorphic-flat-light dark:hover:shadow-neumorphic-flat-dark active:shadow-neumorphic-pressed-light dark:active:shadow-neumorphic-pressed-dark cursor-pointer'
    : interactive && glassVariant
    ? 'hover:bg-light-surface/75 dark:hover:bg-dark-surface/75 active:bg-light-surface/85 dark:active:bg-dark-surface/85 cursor-pointer'
    : '';

  const combinedClassName = [
    baseStyles.trim(),
    shadowStyles.trim(),
    interactive ? interactiveStyles.trim() : '',
    propClassName.trim()
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ');

  const finalStyle = { ...glassInlineStyles, ...userStyle };

  return (
    <Component
      className={combinedClassName}
      style={finalStyle}
      ref={ref}
      {...restHtmlProps}
    >
      {children}
    </Component>
  );
};

// 5. The type for the final component after forwardRef
// This describes the component that is exported and used by consumers.
interface NeumorphicCardComponent {
  <C extends ElementType = 'div'>(
    // Props are the public props, which include 'ref' correctly via ComponentPropsWithRef
    props: NeumorphicCardPublicProps<C>
  ): React.ReactElement | null;
  displayName?: string;
}

const NeumorphicCard = forwardRef<any, any>(NeumorphicCardInner) as NeumorphicCardComponent;
NeumorphicCard.displayName = 'NeumorphicCard';

export default NeumorphicCard;
