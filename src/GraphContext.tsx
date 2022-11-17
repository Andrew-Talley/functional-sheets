import React, { createContext, useContext, useRef } from "react";
import { Graph, Value } from "./businenss/graph";

const GraphContext = createContext(new Graph({}));

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ref = useRef(graphFactory());

  return (
    <GraphContext.Provider value={ref.current}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => useContext(GraphContext);

const fns: Record<string, (...args: Value[]) => Value> = {
  ADD: (...args) =>
    (args.filter((val) => typeof val === "number") as number[]).reduce(
      (prev, cur) => prev + cur,
      0
    ),
  MINUS: (...values) =>
    (values.filter((val) => typeof val === "number") as number[]).reduce(
      (prev, cur) => prev - cur
    ),
  TIMES: (...args) =>
    (args.filter((val) => typeof val === "number") as number[]).reduce(
      (prev, cur) => prev * cur,
      1
    ),
  DIVIDE: (...args) =>
    (args.filter((val) => typeof val === "number") as number[]).reduce(
      (prev, cur) => prev / cur
    ),
};

export function graphFactory(): Graph {
  return new Graph({
    ...fns,
    "+": fns.ADD,
    "-": fns.MINUS,
    "*": fns.TIMES,
    x: fns.TIMES,
    "/": fns.DIVIDE,
  });
}
