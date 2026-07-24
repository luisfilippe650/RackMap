import type { EditorRow } from '../map-editor.types';

export function RowHeaders({
  rows,
  onChange,
  onResize,
  onMove,
  onAdd,
  onRemove
}: {
  rows: EditorRow[];
  onChange: (rowId: string, code: string) => void;
  onResize: (rowId: string, height: number) => void;
  onMove: (rowId: string, direction: -1 | 1) => void;
  onAdd: () => void;
  onRemove: (rowId: string) => void;
}) {
  return (
    <div className="editor-row-headers">
      {rows.map((row) => (
        <div className="editor-row-header" key={row.id} style={{ height: row.height }}>
          <input value={row.code} onChange={(event) => onChange(row.id, event.target.value)} />
          <div className="axis-actions">
            <button type="button" onClick={() => onMove(row.id, -1)}>↑</button>
            <button type="button" onClick={() => onMove(row.id, 1)}>↓</button>
            <button type="button" onClick={() => onRemove(row.id)}>×</button>
          </div>
          <input
            aria-label="Altura da linha"
            min={20}
            type="number"
            value={row.height}
            onChange={(event) => onResize(row.id, Math.max(20, Number(event.target.value)))}
          />
        </div>
      ))}
      <button className="axis-add" type="button" onClick={onAdd}>+</button>
    </div>
  );
}
