import type { MapEditorItem } from '../map-editor.types';
import { gridAreaToPixels } from './grid-coordinates';
import type { EditorColumn, EditorRow } from '../map-editor.types';

export function itemToGridSelection(item: MapEditorItem) {
  return {
    columnIndex: item.startColumnIndex,
    rowIndex: item.startRowIndex,
    columnSpan: item.columnSpan,
    rowSpan: item.rowSpan
  };
}

export function itemGeometry(item: MapEditorItem, columns: EditorColumn[], rows: EditorRow[]) {
  return gridAreaToPixels(itemToGridSelection(item), columns, rows);
}
