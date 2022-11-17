import { describe, expect, it } from "vitest";
import {
  CellReferenceInput,
  FunctionInput,
  NumberInput,
  parseInput,
  StringInput,
} from "./index";

describe("parser", () => {
  it("will allow an empty input", () => {
    expect(parseInput("")).toBeUndefined();
  });

  it("will parse a number", () => {
    const parsedResult = parseInput("123") as NumberInput;
    expect(parsedResult.type).toBe("number");
    expect(parsedResult.value).toBe(123);
  });

  it("will parse a string", () => {
    const parsedResult = parseInput(`"123"`) as StringInput;
    expect(parsedResult.type).toBe("string");
    expect(parsedResult.value).toBe("123");
  });

  it("will support a cell reference", () => {
    const parsedResult = parseInput("A1") as CellReferenceInput;
    expect(parsedResult.type).toBe("cellReference");
    expect(parsedResult.column).toBe("A");
    expect(parsedResult.row).toBe(1);
  });

  describe("functions", () => {
    it("will support an argument-less function", () => {
      const parsedResult = parseInput("(FUN)") as FunctionInput;
      expect(parsedResult.type).toBe("function");
      expect(parsedResult.functionName).toBe("FUN");
      expect(parsedResult.functionArguments).toHaveLength(0);
    });

    it("will support a function with an argument", () => {
      const parsedResult = parseInput("(FUN 1)") as FunctionInput;
      expect(parsedResult.type).toBe("function");

      const argument = parsedResult.functionArguments[0] as NumberInput;
      expect(argument).toBeDefined();
      expect(argument.type).toBe("number");
      expect(argument.value).toBe(1);
    });

    it("will support a function with any number of arguments", () => {
      const parsedResult = parseInput("(FUN 1 2 3 4 5)") as FunctionInput;
      expect(parsedResult.type).toBe("function");
      expect(parsedResult.functionArguments).toHaveLength(5);
    });

    it("will support nested arguments", () => {
      const parsedResult = parseInput("(FUN(FUN(FUN(FUN(FUN)))))") as any;

      expect(parsedResult.type).toBe("function");
      expect(
        parsedResult.functionArguments[0].functionArguments[0]
          .functionArguments[0].type
      ).toBe("function");
    });
  });
});
