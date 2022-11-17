import { CellReferenceInput, EquationInput, parseInput } from "../parser";

type Cell = string;
type Error = {
  type: "error";
  errorMessage: string;
};
export type Value = number | string | Error | undefined;

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

    for (const dependency of this.derivedFromMap[cell]) {
      if (!(dependency in this.dependentsMap)) {
        this.dependentsMap[dependency] = new Set();
      }

      this.dependentsMap[dependency].add(cell);
    }
  }

  #evaluateExpression(expression: EquationInput | undefined): Value {
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
      case "function":
        const fn = this.methodMap[expression.functionName.toUpperCase()];
        if (!fn) {
          return {
            type: "error",
            errorMessage: "Unknown function " + expression.functionName,
          };
        }

        const args = expression.functionArguments.map((arg) =>
          this.#evaluateExpression(arg)
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
      this.expressionMap[cell]
    );
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
