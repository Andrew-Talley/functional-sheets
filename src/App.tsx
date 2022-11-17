import { useInit, useQuery, tx, transact } from "@instantdb/react";
import React, { createContext, useCallback, useRef, useState } from "react";
import { GridCell } from "./GridCell";
import { Login } from "./Login";
import { GraphProvider } from "./GraphContext";
import { AuthProvider } from "./AuthProvider";

function indToCol(ind: number) {
  return String.fromCharCode(ind + "A".charCodeAt(0));
}

function colToInd(col: string) {
  return col.charCodeAt(0) - "A".charCodeAt(0);
}

function DebugComponent() {
  const query = useQuery({ cells: {} });
  return <div>{JSON.stringify(query)}</div>;
}

function DeleteGridButton() {
  const { cells } = useQuery({ cells: {} });

  const deleteAll = () => {
    transact(cells.map((c: any) => tx.cells[c.id].delete()));
  };

  return <button onClick={deleteAll}>Reset Grid</button>;
}

function Spreadsheet() {
  const [[focusedCol, focusedRow], setFocus] = useState<
    [number, number] | [null, null]
  >([null, null]);

  const onKeyUp = (event: React.KeyboardEvent) => {
    event.preventDefault();
    let movement = [0, 0];

    if (event.key === "Tab") {
      movement[0] = event.shiftKey ? -1 : 1;
    } else if (event.key === "Enter") {
      movement[1] = event.shiftKey ? -1 : 1;
    } else if (event.key === "ArrowUp") {
      movement[1] = -1;
    } else if (event.key === "ArrowDown") {
      movement[1] = 1;
    } else if (event.key === "ArrowLeft") {
      movement[0] = -1;
    } else if (event.key === "ArrowRight") {
      movement[0] = 1;
    }

    if (movement[0] !== 0 || movement[1] !== 0) {
      setFocus(([col, row]) => {
        if (col === null) {
          return [0, 0];
        }

        const newCol = col + movement[0];
        const newRow = row + movement[1];

        if (newCol >= 10 || newCol < 0 || newRow >= 10 || newRow < 0) {
          return [col, row];
        } else {
          return [newCol, newRow];
        }
      });
    }
  };

  const onCellClick = useCallback((cell: string) => {
    setFocus([colToInd(cell.charAt(0)), parseInt(cell.slice(1))]);
  }, []);

  return (
    <table cellSpacing={1} cellPadding={1} onKeyUp={onKeyUp}>
      <thead>
        <tr>
          <td />
          {Array.from(new Array(10), (_, colInd) => {
            const col = indToCol(colInd);
            return <th key={col}>{col}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {Array.from(new Array(10), (_, row_1) => {
          const row = row_1 + 1;
          return (
            <tr key={row}>
              <td>{row}</td>
              {Array.from(new Array(10), (_, colInd) => {
                const cell = `${indToCol(colInd)}${row}`;
                return (
                  <GridCell
                    key={cell}
                    tabIndex={row * 10 + colInd + 1}
                    onClick={onCellClick}
                    focused={focusedCol === colInd && focusedRow === row}
                    cell={cell}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function App() {
  const [isLoading, error, auth] = useInit({
    appId: "7411a2fb-38dd-4ee1-b5ba-c59e3870f034",
    websocketURI: "wss://instant-server-clj.herokuapp.com/api/runtime/sync",
    apiURI: "https://instant-server-clj.herokuapp.com/api",
  });

  return (
    <>
      {isLoading ? (
        "Loading"
      ) : error ? (
        "Error: " + error.message
      ) : !auth ? (
        <Login />
      ) : (
        <AuthProvider value={auth}>
          <GraphProvider>
            <Spreadsheet />
            <DeleteGridButton />
          </GraphProvider>
        </AuthProvider>
      )}
    </>
  );
}

export default App;
