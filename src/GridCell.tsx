import { useQuery, tx, transact } from "@instantdb/react";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useGraph } from "./GraphContext";
import { useCellValue } from "./useCell";

interface EditableGridCellProps {
  initialValue: string;
  onSubmit: (newValue: string) => void;
  onCancel: () => void;
}
const EditableGridCell = ({
  initialValue,
  onSubmit,
  onCancel,
}: EditableGridCellProps) => {
  const [value, setValue] = useState(initialValue);

  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => inputRef.current?.focus());

  return (
    <input
      onBlur={() => {
        onSubmit(value);
      }}
      onKeyUp={(e) => {
        if (e.code === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          onSubmit(value);
        } else if (e.code === "Escape") {
          setValue(initialValue);
          onCancel();
        }
      }}
      style={{ width: "100%" }}
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
interface GridCellProps {
  cell: string;
  focused: boolean;
  tabIndex: number;
  onClick: (cell: string) => void;
}
export const GridCell = memo(
  ({ tabIndex, cell, focused, onClick }: GridCellProps) => {
    const [value, renderedValue, onChange] = useCellValue(cell);

    const [isEditing, setIsEditing] = useState(false);

    const focusRef = useRef<HTMLTableDataCellElement>(null);

    useLayoutEffect(() => {
      if (focused) {
        focusRef.current?.focus();
      } else if (document.activeElement === focusRef.current) {
        focusRef.current?.blur();
      }
    }, [focused]);

    return (
      <td
        ref={focusRef}
        className="border-stone-800 focus-within:border-blue-800 border focus-within:border-2 w-28 h-6 outline-none"
        onDoubleClick={() => setIsEditing(true)}
        onClick={() => onClick(cell)}
        tabIndex={tabIndex}
        onKeyUp={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();

            setIsEditing(true);
          } else if (event.key.length === 1) {
            console.log(event.key);
          }
        }}
      >
        {isEditing ? (
          <EditableGridCell
            initialValue={value}
            onSubmit={(value) => {
              onChange(value);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : typeof renderedValue === "object" ? (
          renderedValue.errorMessage
        ) : (
          renderedValue
        )}
      </td>
    );
  }
);
