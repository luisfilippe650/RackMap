import type { EditorColumn, EditorRow, GridCell, GridSelection } from '../map-editor.types';

export function totalWidth(columns: EditorColumn[]) {
  return columns.reduce((total, column) => total + column.width, 0);
}

export function totalHeight(rows: EditorRow[]) {
  return rows.reduce((total, row) => total + row.height, 0);
}

export function columnOffset(columns: EditorColumn[], columnIndex: number) {
  return columns.slice(0, columnIndex).reduce((total, column) => total + column.width, 0);
}

export function rowOffset(rows: EditorRow[], rowIndex: number) {
  return rows.slice(0, rowIndex).reduce((total, row) => total + row.height, 0);
}

export function cellFromPoint(x: number, y: number, columns: EditorColumn[], rows: EditorRow[]): GridCell {
  let accumulatedX = 0;
  let columnIndex = columns.length - 1;

  for (const [index, column] of columns.entries()) {
    if (x < accumulatedX + column.width) {
      columnIndex = index;
      break;
    }
    accumulatedX += column.width;
  }

  let accumulatedY = 0;
  let rowIndex = rows.length - 1;

  for (const [index, row] of rows.entries()) {
    if (y < accumulatedY + row.height) {
      rowIndex = index;
      break;
    }
    accumulatedY += row.height;
  }

  return {
    columnIndex: Math.max(0, Math.min(columns.length - 1, columnIndex)),
    rowIndex: Math.max(0, Math.min(rows.length - 1, rowIndex))
  };
}

export function selectionFromCells(start: GridCell, end: GridCell): GridSelection {
  const startColumnIndex = Math.min(start.columnIndex, end.columnIndex);
  const startRowIndex = Math.min(start.rowIndex, end.rowIndex);
  const endColumnIndex = Math.max(start.columnIndex, end.columnIndex);
  const endRowIndex = Math.max(start.rowIndex, end.rowIndex);

  return {
    columnIndex: startColumnIndex,
    rowIndex: startRowIndex,
    columnSpan: endColumnIndex - startColumnIndex + 1,
    rowSpan: endRowIndex - startRowIndex + 1
  };
}

export function gridAreaToPixels(selection: GridSelection, columns: EditorColumn[], rows: EditorRow[]) {
  return {
    left: columnOffset(columns, selection.columnIndex),
    top: rowOffset(rows, selection.rowIndex),
    width: columns.slice(selection.columnIndex, selection.columnIndex + selection.columnSpan).reduce((total, column) => total + column.width, 0),
    height: rows.slice(selection.rowIndex, selection.rowIndex + selection.rowSpan).reduce((total, row) => total + row.height, 0)
  };
}

export function clampGridItem(
  item: { startColumnIndex: number; startRowIndex: number; columnSpan: number; rowSpan: number },
  columnCount: number,
  rowCount: number
) {
  return {
    ...item,
    columnSpan: Math.max(1, Math.min(item.columnSpan, columnCount)),
    rowSpan: Math.max(1, Math.min(item.rowSpan, rowCount)),
    startColumnIndex: Math.max(0, Math.min(item.startColumnIndex, columnCount - item.columnSpan)),
    startRowIndex: Math.max(0, Math.min(item.startRowIndex, rowCount - item.rowSpan))
  };
}
