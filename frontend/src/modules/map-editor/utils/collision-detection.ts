import type { MapEditorItem } from '../map-editor.types';

function cellsFor(item: Pick<MapEditorItem, 'startColumnIndex' | 'startRowIndex' | 'columnSpan' | 'rowSpan'>) {
  const cells = new Set<string>();

  for (let column = item.startColumnIndex; column < item.startColumnIndex + item.columnSpan; column += 1) {
    for (let row = item.startRowIndex; row < item.startRowIndex + item.rowSpan; row += 1) {
      cells.add(`${column}:${row}`);
    }
  }

  return cells;
}

export function findCollision(candidate: MapEditorItem, items: MapEditorItem[]) {
  const candidateCells = cellsFor(candidate);

  return items.find((item) => {
    if (item.id === candidate.id) {
      return false;
    }

    const itemCells = cellsFor(item);

    return [...candidateCells].some((cell) => itemCells.has(cell));
  });
}

export function getCollisionMessage(candidate: MapEditorItem, collided?: MapEditorItem) {
  if (!collided) {
    return null;
  }

  return `${candidate.type} nao pode ocupar a mesma celula de ${collided.type}.`;
}
