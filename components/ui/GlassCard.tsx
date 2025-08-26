import React, { ElementType, forwardRef, ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';
import NeumorphicCard, { NeumorphicCardOwnProps } from './NeumorphicCard';

/**
 * A reusable card component with a "glassmorphism" effect.
 * It's a specialized version of NeumorphicCard with the glassVariant prop enabled.
 * This component supports polymorphism via the `as` prop and forwards refs correctly.
 */

// 1. Define the props that GlassCard will accept.
// It accepts all NeumorphicCard props except for `glassVariant`, which is fixed.
type GlassCardOwnProps = Omit<NeumorphicCardOwnProps, 'glassVariant'>;

// 2. Define a generic ref type for polymorphism, consistent with NeumorphicCard.
type PolymorphicRef<C extends ElementType> = ComponentPropsWithRef<C>['ref'];

// 3. Define props for the inner component that will be wrapped by forwardRef.
// It includes our own props, the 'as' prop, and any other valid HTML attributes for the element type C.
// We explicitly omit `glassVariant` from the final props to prevent it from being passed by the user.
type GlassCardInnerProps<C extends ElementType> = GlassCardOwnProps & {
  as?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof GlassCardOwnProps | 'as' | 'glassVariant'>;

// 4. Define props for the public-facing component that consumers will use.
// This is similar to InnerProps but uses ComponentPropsWithRef to include the `ref` prop.
type GlassCardPublicProps<C extends ElementType> = GlassCardOwnProps & {
  as?: C;
} & Omit<ComponentPropsWithRef<C>, keyof GlassCardOwnProps | 'as' | 'glassVariant'>;

// The inner component implementation.
// It receives props and a ref, and renders a NeumorphicCard with the glassVariant set.
const GlassCardInner = (props: any, ref: any) => {
  // Ensure glassVariant cannot be overridden by consumers
  const finalProps = { ...props, glassVariant: true };
  return <NeumorphicCard {...finalProps} ref={ref} />;
};

// 5. Define the type for the final component after applying forwardRef.
// This gives us correct typing for the polymorphic component.
interface GlassCardComponent {
  <C extends ElementType = 'div'>(
    props: GlassCardPublicProps<C>
  ): React.ReactElement | null;
  displayName?: string;
}

// 6. Create the final component using forwardRef and cast it to our defined type.
const GlassCard = forwardRef<any, any>(GlassCardInner) as GlassCardComponent;
GlassCard.displayName = 'GlassCard';

export default GlassCard;