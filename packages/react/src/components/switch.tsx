import type { ComponentType, ReactNode, FC } from "react";

type CaseComponent = ReactNode | ComponentType;

export interface SwitchProps {
  /** List of case components to be rendered when case matches */
  components: Record<string | number, CaseComponent>;
  /** Default component to be rendered if the value does not match any of the given cases */
  defaultComponent?: CaseComponent;
  /** Value to check with the cases to render the corresponding component */
  value: string | number;
}

function renderCase(component: CaseComponent | undefined) {
  if (!component) return null;

  if (typeof component === "function") {
    const Component = component as ComponentType;
    return <Component />;
  }

  return <>{component}</>;
}

export const Switch: FC<SwitchProps> = ({
  components,
  defaultComponent,
  value,
}) => {
  // Direct object lookup. No loops, no hidden nodes.
  const matchedComponent = components[value];

  if (matchedComponent !== undefined) {
    return renderCase(matchedComponent);
  }

  return renderCase(defaultComponent);
};
