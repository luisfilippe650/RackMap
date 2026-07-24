import type { EditorColumn, EditorRow, MapElementDraft } from '../map-editor.types';
import { itemGeometry } from '../utils/element-geometry';
import { ResizeHandles } from './ResizeHandles';

export function FixedMapElement({ element, columns, rows, selected }: { element: MapElementDraft; columns: EditorColumn[]; rows: EditorRow[]; selected: boolean }) {
  return (
    <div
      className={`editor-item editor-fixed editor-fixed-${element.type.toLowerCase()} ${selected ? 'selected' : ''}`}
      data-editor-item-id={element.id}
      style={{
        ...itemGeometry(element, columns, rows),
        zIndex: element.zIndex,
        backgroundColor: element.fillColor ?? undefined,
        borderColor: element.borderColor ?? undefined,
        color: element.textColor ?? undefined
      }}
    >
      <strong>{element.label ?? element.type}</strong>
      {selected ? <ResizeHandles /> : null}
    </div>
  );
}
