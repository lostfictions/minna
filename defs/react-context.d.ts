import React from "react";

declare module "react" {
  // Context via RenderProps
  type Provider<T> = ComponentType<{
    value: T;
    children?: ReactNode;
  }>;
  type Consumer<T> = ComponentType<{
    children: (value: T) => ReactNode;
    unstable_observedBits?: number;
  }>;
  interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
  }
  function createContext<T>(
    defaultValue: T,
    calculateChangedBits?: (prev: T, next: T) => number
  ): Context<T>;
  function createContext<T>(): Context<T | undefined>;
}
