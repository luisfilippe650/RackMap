import type { EditorColumn, EditorRow } from '../map-editor.types';

export function GridLayer({ columns, rows }: { columns: EditorColumn[]; rows: EditorRow[] }) {
  return (
    <div
      className="editor-grid-layer"
      style={{
        gridTemplateColumns: columns.map((column) => `${column.width}px`).join(' '),
        gridTemplateRows: rows.map((row) => `${row.height}px`).join(' ')
      }}
    >
      {rows.flatMap((row, rowIndex) =>
        columns.map((column, columnIndex) => (
          <div className="editor-grid-cell" data-column={columnIndex} data-row={rowIndex} key={`${column.id}-${row.id}`} />
        ))
      )}
    </div>
  );
}
