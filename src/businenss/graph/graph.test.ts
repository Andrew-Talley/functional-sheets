import { beforeEach, describe, it, expect } from "vitest";
import { Graph } from "./index";

function createCellWithDependencies(
  ...dependencies: [string, number][]
): string {
  return "(FN " + dependencies.map(([c, r]) => `${c}${r}`).join(" ") + ")";
}

describe("graph", () => {
  let graph: Graph;

  beforeEach(() => {
    graph = new Graph({});
  });

  describe("dependency tracking", () => {
    it("will return an empty set for a cell with no dependencies", () => {
      graph.updateCell("A1", createCellWithDependencies());
      expect(Array.from(graph.cellsDependentOn("A1"))).toHaveLength(0);
    });

    it("will show when a cell is dependent on another cell", () => {
      graph.updateCell("A1", createCellWithDependencies(["B", 2]));
      expect(Array.from(graph.cellsDependentOn("B2"))).toHaveLength(1);
    });

    it("will show when multiple cells are dependent on a cell", () => {
      graph.updateCell("A1", createCellWithDependencies(["B", 2]));
      graph.updateCell("C3", createCellWithDependencies(["B", 2]));
      graph.updateCell("D4", createCellWithDependencies(["B", 2]));
      expect(Array.from(graph.cellsDependentOn("B2"))).toHaveLength(3);
    });
  });

  describe("evaluation", () => {
    it("will return undefined before a cell has been updated", () => {
      expect(graph.valueOfCell("A1")).toBeUndefined();
    });

    it("will trap errors", () => {
      expect(() => graph.updateCell("A1", "This is invalid")).not.toThrow();
      expect(graph.valueOfCell("A1")).toHaveProperty("errorMessage");
    });

    it("will return a number", () => {
      graph.updateCell("A1", "2");
      expect(graph.valueOfCell("A1")).toBe(2);
    });

    it("will allow clearing a cell", () => {
      graph.updateCell("A1", "2");
      graph.updateCell("A1", "");
      expect(graph.valueOfCell("A1")).toBeUndefined();
    });

    it("will return a value referenced from another cell", () => {
      graph.updateCell("A1", "2");
      graph.updateCell("A2", "A1");
      expect(graph.valueOfCell("A2")).toBe(2);
    });

    it("will update dependent nodes", () => {
      graph.updateCell("A1", "1");
      graph.updateCell("A2", "A1");
      graph.updateCell("A1", "2");
      expect(graph.valueOfCell("A2")).toBe(2);
    });

    it("will evaluate an argument-less function", () => {
      graph = new Graph({ PI: () => 3.14 });
      graph.updateCell("A1", "(PI)");
      expect(graph.valueOfCell("A1")).toBe(3.14);
    });

    it("will evaluate a function with arguments", () => {
      const graph = new Graph({ ADD: (a, b) => (a as number) + (b as number) });
      graph.updateCell("A1", "(ADD 1 2)");
      expect(graph.valueOfCell("A1")).toBe(3);
    });

    it("will handle a complex example", () => {
      const graph = new Graph({ ADD: (a, b) => (a as number) + (b as number) });
      graph.updateCell("A1", "2");
      graph.updateCell("A2", "3");
      graph.updateCell("B1", "A1");
      graph.updateCell("B2", "(ADD A2 B1)");
      expect(graph.valueOfCell("B2")).toBe(5);
    });
  });

  describe("bulk updates", () => {
    it("will support updating multiple cells", () => {
      graph.updateCells([
        ["A1", "1"],
        ["A2", "2"],
      ]);

      expect(graph.valueOfCell("A1")).toBe(1);
      expect(graph.valueOfCell("A2")).toBe(2);
    });

    it("will not break when using a reference", () => {
      graph.updateCells([
        ["A1", "A2"],
        ["A2", "2"],
        ["A3", "A2"],
      ]);

      expect(graph.valueOfCell("A1")).toBe(2);
      expect(graph.valueOfCell("A2")).toBe(2);
      expect(graph.valueOfCell("A3")).toBe(2);
    });
  });
});
