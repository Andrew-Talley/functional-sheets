import { id, transact, tx, useQuery } from "@instantdb/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useGraph } from "./GraphContext";

export function useCellValue(cell: string) {
  const auth = useAuth();
  const graph = useGraph();
  const { spreadsheets } = useQuery({
    spreadsheets: {
      $: { where: { user: auth.id, spreadsheetName: "default" } },
    },
  });

  let spreadsheetId = spreadsheets[0]?.id;
  if (!spreadsheetId) {
    transact([
      tx.spreadsheets[id()].update({
        user: auth.id,
        spreadsheetName: "default",
      }),
    ]);
  }

  const { cells } = useQuery({
    cells: {
      $: {
        where: {
          cell,
          "spreadsheets.id": spreadsheetId,
        },
      },
    },
  });

  const dbCell = cells[0];
  const value = dbCell?.value ?? "";

  const onChange = useCallback(
    (value: string) => {
      const cellId = dbCell?.id ?? id();
      console.log({ cellId, cell, value, spreadsheetId });
      transact([
        tx.cells[cellId]
          .update({ cell, value })
          .link({ spreadsheets: spreadsheetId }),
      ]);
      graph.updateCell(cell, value);
    },
    [spreadsheetId, cell, dbCell?.id]
  );

  useEffect(() => {
    graph.updateCell(cell, value);
  });

  const renderedValue = graph.valueOfCell(cell);

  return [value, renderedValue, onChange];
}
