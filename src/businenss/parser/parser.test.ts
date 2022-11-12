import { describe, expect, it } from "vitest";
import {
  CellReferenceInput,
  FunctionInput,
  NumberInput,
  parseInput,
} from "./index";

describe("parser", () => {
  it("will allow an empty input", () => {
    expect(parseInput("")).toBeUndefined();
  });

  it("will parse a number", () => {
    const parsedResult = parseInput<NumberInput>("123");
    expect(parsedResult.type).toBe("number");
    expect(parsedResult.value).toBe(123);
  });

  it("will support a cell reference", () => {
    const parsedResult = parseInput<CellReferenceInput>("A1");
    expect(parsedResult.type).toBe("cellReference");
    expect(parsedResult.column).toBe("A");
    expect(parsedResult.row).toBe(1);
  });

  describe("functions", () => {
    it("will support an argument-less function", () => {
      const parsedResult = parseInput<FunctionInput>("(FUN)");
      expect(parsedResult.type).toBe("function");
      expect(parsedResult.functionName).toBe("FUN");
      expect(parsedResult.functionArguments).toHaveLength(0);
    });

    it("will support a function with an argument", () => {
      const parsedResult = parseInput<FunctionInput>("(FUN 1)");
      expect(parsedResult.type).toBe("function");

      const argument = parsedResult.functionArguments[0] as NumberInput;
      expect(argument).toBeDefined();
      expect(argument.type).toBe("number");
      expect(argument.value).toBe(1);
    });

    it("will support a function with any number of arguments", () => {
      const parsedResult = parseInput<FunctionInput>("(FUN 1 2 3 4 5)");
      expect(parsedResult.type).toBe("function");
      expect(parsedResult.functionArguments).toHaveLength(5);
    });

    it("will support nested arguments", () => {
      const parsedResult = parseInput<any>("(FUN(FUN(FUN(FUN(FUN)))))");

      expect(parsedResult.type).toBe("function");
      expect(
        parsedResult.functionArguments[0].functionArguments[0]
          .functionArguments[0].type
      ).toBe("function");
    });
  });
});
