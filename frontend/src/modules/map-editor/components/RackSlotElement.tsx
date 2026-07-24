import type { EditorColumn, EditorRow, RackSlotDraft } from '../map-editor.types';
import { itemGeometry } from '../utils/element-geometry';
import { ResizeHandles } from './ResizeHandles';

export function RackSlotElement({ slot, columns, rows, selected }: { slot: RackSlotDraft; columns: EditorColumn[]; rows: EditorRow[]; selected: boolean }) {
  const rackAddress = [slot.normalizedRowCode, slot.rackCode].filter(Boolean).join('-');
  const displayName = slot.label ?? slot.rackTablesRackName ?? slot.rackName ?? (rackAddress || 'Rack');

  return (
    <div
      className={`editor-item editor-rack-slot ${selected ? 'selected' : ''}`}
      data-editor-item-id={slot.id}
      style={{
        ...itemGeometry(slot, columns, rows),
        zIndex: slot.zIndex,
        backgroundColor: slot.fillColor ?? undefined,
        borderColor: slot.borderColor ?? undefined,
        color: slot.textColor ?? undefined
      }}
    >
      <strong>{displayName}</strong>
      <span>{slot.rackTablesRackName ?? (rackAddress || 'Sem vinculo')}</span>
      {selected ? <ResizeHandles /> : null}
    </div>
  );
}
