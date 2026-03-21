import type { ReactNode } from "react";

type Props = {
  condition: boolean;
  children: ReactNode;
};

export const If = ({ condition, children }: Props) => {
  return condition ? <>{children}</> : null;
};
