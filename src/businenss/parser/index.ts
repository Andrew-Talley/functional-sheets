export interface NumberInput {
  type: "number";
  value: number;
}

export interface CellReferenceInput {
  type: "cellReference";
  column: string;
  row: number;
}

export interface FunctionInput {
  type: "function";
  functionName: string;
  functionArguments: EquationInput[];
}

export interface ErrorInput {
  type: "error";
  errorMessage: string;
}

export type EquationInput =
  | NumberInput
  | CellReferenceInput
  | FunctionInput
  | ErrorInput;

const WS_CHARS = [" ", "\n", "\t", "\r"];
const WS_REGEX = new RegExp(`[${WS_CHARS.join("")}]+`, "g");

const NUMBER_REGEX = /[0-9]/;

const LETTER_REGEX = /[A-Za-z]/;

interface Token {
  type: "value" | "open-paren" | "close-paren";
  value: string;
}

const OPEN_PAREN_TOKEN: Token = {
  type: "open-paren",
  value: "(",
};

const CLOSE_PAREN_TOKEN: Token = {
  type: "close-paren",
  value: ")",
};

function tokenizeInput(input: string) {
  let tokens: Token[] = [];
  let currentIndex = 0;
  while (currentIndex < input.length) {
    if (input.charAt(currentIndex) === " ") {
      currentIndex++;
    } else if (input.charAt(currentIndex) === "(") {
      tokens.push(OPEN_PAREN_TOKEN);
      currentIndex++;
    } else if (input.charAt(currentIndex) === ")") {
      tokens.push(CLOSE_PAREN_TOKEN);
      currentIndex++;
    } else {
      const chars = ["(", ")", " "];
      const endIndex = Math.min(
        input.length,
        ...chars
          .map((char) => input.indexOf(char, currentIndex + 1))
          .filter((ind) => ind !== -1)
      );
      tokens.push({
        type: "value",
        value: input.slice(currentIndex, endIndex),
      });
      currentIndex = endIndex;
    }
  }

  return tokens;
}

function parseValue(value: string): NumberInput | CellReferenceInput {
  if (/^[0-9]+$/.test(value)) {
    return {
      type: "number",
      value: parseInt(value),
    };
  } else if (/^[A-Z]+[0-9]+/.test(value)) {
    const result = /^([A-Z]+)([0-9]+)/.exec(value);
    const column = result![1],
      row = result![2];
    return {
      type: "cellReference",
      column,
      row: parseInt(row),
    };
  } else {
    throw new Error("Unknown value: " + value);
  }
}

function generateAst(tokens: Token[]): EquationInput {
  if (tokens[0].type === "close-paren") {
    throw new Error("Unexpected close paren at start of expression");
  } else if (tokens[0].type === "value") {
    if (tokens.length > 1) {
      throw new Error("Unexpected tokens after simple value");
    }
    return parseValue(tokens[0].value);
  } else if (tokens[0].type === "open-paren") {
    const functionName = tokens[1].value.toUpperCase();

    let numOpenParens = 1;
    let functionArguments: EquationInput[] = [];

    let startIndex = 2;
    let currentIndex = 2;

    function addCurrentArgument() {
      functionArguments.push(
        generateAst(tokens.slice(startIndex, currentIndex + 1))
      );

      startIndex = currentIndex + 1;
    }

    while (currentIndex < tokens.length) {
      if (tokens[currentIndex].type === "open-paren") {
        numOpenParens++;
      } else if (tokens[currentIndex].type === "close-paren") {
        numOpenParens--;
      }

      if (numOpenParens === 1) {
        addCurrentArgument();
      } else if (numOpenParens === 0) {
        break;
      }
      currentIndex++;
    }

    return {
      type: "function",
      functionName,
      functionArguments,
    };
  } else {
    throw new Error("Unknown type " + tokens[0].type);
  }
}

export function parseInput<K extends EquationInput | undefined>(
  input: string
): K {
  try {
    const whitespaceStrippedInput = input.replace(WS_REGEX, " ");
    const tokens = tokenizeInput(whitespaceStrippedInput);

    if (tokens.length === 0) {
      return undefined as K;
    }

    return generateAst(tokens) as K;
  } catch (e) {
    return {
      type: "error",
      errorMessage: (e as Error).message,
    } as K;
  }
}
