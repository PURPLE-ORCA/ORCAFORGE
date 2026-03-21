import {
  Children,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";

type WhenProps = {
  condition: boolean;
  children: ReactNode;
};

type ElseProps = {
  render?: () => ReactNode;
  children?: ReactNode;
};

type ShowProps = {
  children: ReactNode;
};

export const Show = ({ children }: ShowProps) => {
  let when: ReactNode | null = null;
  let otherwise: ReactNode | null = null;

  Children.forEach(children, (child) => {
    // Tell TS that if this is an element, it *might* have a condition prop
    if (isValidElement<{ condition?: boolean }>(child)) {
      if (child.props.condition === undefined) {
        otherwise = child;
      } else if (!when && child.props.condition === true) {
        when = child;
      }
    }
  });

  return (when || otherwise) as ReactElement | null;
};

Show.When = ({ children }: WhenProps) => <>{children}</>;
Show.Else = ({ render, children }: ElseProps) => (
  <>{render ? render() : children}</>
);
