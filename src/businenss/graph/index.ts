import {
  CellRangeInput,
  CellReferenceInput,
  EquationInput,
  parseInput,
} from "../parser";

type Cell = string;
type Error = {
  type: "error";
  errorMessage: string;
};
export type Value = number | string | Error | undefined | Value[][];

export class Graph {
  derivedFromMap: Record<Cell, Set<Cell>> = {};
  dependentsMap: Record<Cell, Set<Cell>> = {};

  expressionMap: Record<Cell, EquationInput | undefined> = {};
  evaluationMap: Record<Cell, Value> = {};

  constructor(private methodMap: Record<string, (...args: Value[]) => Value>) {}

  static #cellFromReference(input: CellReferenceInput): Cell {
    return `${input.column}${input.row}`;
  }

  static #getAllDependencies(
    expression: EquationInput | undefined,
    currentDependencies = new Set<Cell>()
  ): Set<Cell> {
    if (expression === undefined) {
      return currentDependencies;
    }

    switch (expression.type) {
      case "number":
        break;
      case "cellReference":
        currentDependencies.add(Graph.#cellFromReference(expression));
        break;
      case "cellRange":
        for (const cell of Graph.#cellsForRange(expression).flat()) {
          currentDependencies.add(Graph.#cellFromReference(cell));
        }
        break;
      case "function":
        for (const argument of expression.functionArguments) {
          Graph.#getAllDependencies(argument, currentDependencies);
        }
    }

    return currentDependencies;
  }

  cellsDependentOn(cell: Cell): Iterable<Cell> {
    return this.dependentsMap[cell] ?? [];
  }

  valueOfCell(cell: Cell) {
    return this.evaluationMap[cell];
  }

  #updateCellDependencies(cell: Cell, expression: EquationInput | undefined) {
    const currentDependents = this.derivedFromMap[cell] ?? [];
    for (const dependency of currentDependents) {
      this.dependentsMap[dependency].delete(cell);
    }

    this.derivedFromMap[cell] = Graph.#getAllDependencies(expression);
    if (this.derivedFromMap[cell].has(cell)) {
      this.derivedFromMap[cell] = new Set();
    }

    for (const dependency of this.derivedFromMap[cell]) {
      if (!(dependency in this.dependentsMap)) {
        this.dependentsMap[dependency] = new Set();
      }

      this.dependentsMap[dependency].add(cell);
    }
  }

  static #cellsForRange(range: CellRangeInput): CellReferenceInput[][] {
    const startColumn = range.start.column,
      endColumn = range.end.column;
    if (startColumn > endColumn) {
      throw new Error("Start column must be before end column");
    }

    const startRow = range.start.row,
      endRow = range.end.row;
    if (startRow > endRow) {
      throw new Error("Start row must be before end row");
    }

    const output: CellReferenceInput[][] = [];
    for (
      let column = startColumn;
      column <= endColumn;
      column = String.fromCharCode(column.charCodeAt(0) + 1)
    ) {
      let outputRow: CellReferenceInput[] = [];
      for (let row = startRow; row <= endRow; row++) {
        outputRow.push({
          type: "cellReference",
          column,
          row,
        });
      }
      output.push(outputRow);
    }

    return output;
  }

  #evaluateExpression(
    expression: EquationInput | undefined,
    currentCell: Cell
  ): Value {
    if (!expression) {
      return undefined;
    }

    switch (expression.type) {
      case "number":
        return expression.value;
      case "string":
        return expression.value;
      case "cellReference":
        return this.evaluationMap[Graph.#cellFromReference(expression)];
      case "cellRange":
        const cells = Graph.#cellsForRange(expression);
        if (
          cells
            .flat()
            .some((cell) => Graph.#cellFromReference(cell) === currentCell)
        ) {
          return {
            type: "error",
            errorMessage: "Self referencing cell: " + currentCell,
          };
        }
        return cells.map((row) =>
          row.map((cell) =>
            this.#evaluateExpression(cell, Graph.#cellFromReference(cell))
          )
        );
      case "function":
        const fn = this.methodMap[expression.functionName.toUpperCase()];
        if (!fn) {
          return {
            type: "error",
            errorMessage: "Unknown function " + expression.functionName,
          };
        }

        const args = expression.functionArguments.map((arg) =>
          this.#evaluateExpression(arg, currentCell)
        );
        return fn(...args);
      case "error":
        return expression;
    }
  }

  updateCell(cell: Cell, input: string) {
    try {
      const expression = parseInput(input);
      this.#updateCellDependencies(cell, expression);
      this.expressionMap[cell] = expression;
      this.evaluateCellAndAllDependencies(cell);
    } catch (e) {
      this.expressionMap;
    }
  }

  evaluateCellAndAllDependencies(cell: Cell) {
    this.evaluationMap[cell] = this.#evaluateExpression(
      this.expressionMap[cell],
      cell
    );
    if (Array.isArray(this.evaluationMap[cell])) {
      this.evaluationMap[cell] = {
        type: "error",
        errorMessage: "Cannot return cell range as value",
      };
    }
    for (const dependent of this.dependentsMap[cell] ?? []) {
      this.evaluateCellAndAllDependencies(dependent);
    }
  }

  updateCells(updates: [Cell, string][]) {
    for (const [cell, expression] of updates) {
      this.updateCell(cell, expression);
    }
  }
}
