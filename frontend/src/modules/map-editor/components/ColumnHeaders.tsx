import type { EditorColumn } from '../map-editor.types';

export function ColumnHeaders({
  columns,
  onChange,
  onResize,
  onMove,
  onAdd,
  onRemove
}: {
  columns: EditorColumn[];
  onChange: (columnId: string, code: string) => void;
  onResize: (columnId: string, width: number) => void;
  onMove: (columnId: string, direction: -1 | 1) => void;
  onAdd: () => void;
  onRemove: (columnId: string) => void;
}) {
  return (
    <div className="editor-column-headers">
      {columns.map((column) => (
        <div className="editor-column-header" key={column.id} style={{ width: column.width }}>
          <input value={column.code} onChange={(event) => onChange(column.id, event.target.value)} />
          <div className="axis-actions">
            <button type="button" onClick={() => onMove(column.id, -1)}>‹</button>
            <button type="button" onClick={() => onMove(column.id, 1)}>›</button>
            <button type="button" onClick={() => onRemove(column.id)}>×</button>
          </div>
          <input
            aria-label="Largura da coluna"
            min={24}
            type="number"
            value={column.width}
            onChange={(event) => onResize(column.id, Math.max(24, Number(event.target.value)))}
          />
        </div>
      ))}
      <button className="axis-add" type="button" onClick={onAdd}>+</button>
    </div>
  );
}
