import type { EditorColumn, EditorRow, GridSelection } from '../map-editor.types';
import { gridAreaToPixels } from '../utils/grid-coordinates';

export function SelectionOverlay({ selection, columns, rows, invalid }: { selection: GridSelection | null; columns: EditorColumn[]; rows: EditorRow[]; invalid: boolean }) {
  if (!selection) {
    return null;
  }

  const geometry = gridAreaToPixels(selection, columns, rows);

  return <div className={`selection-overlay ${invalid ? 'invalid' : ''}`} style={geometry} />;
}
