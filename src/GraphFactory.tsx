import { Graph, Value } from "./businenss/graph";

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
