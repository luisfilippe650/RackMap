import { useMemo, useRef, useState } from 'react';
import type { EditorElementType, GridCell, GridSelection, MapEditorItem, MapEditorState } from '../map-editor.types';
import { findCollision, getCollisionMessage } from '../utils/collision-detection';
import { cellFromPoint, clampGridItem, selectionFromCells, totalHeight, totalWidth } from '../utils/grid-coordinates';
import { ColumnHeaders } from './ColumnHeaders';
import { FixedMapElement } from './FixedMapElement';
import { GridLayer } from './GridLayer';
import { RackSlotElement } from './RackSlotElement';
import { RowHeaders } from './RowHeaders';
import { SelectionOverlay } from './SelectionOverlay';
import { itemGeometry } from '../utils/element-geometry';

type DragState =
  | { kind: 'create'; start: GridCell; current: GridCell }
  | { kind: 'move'; itemId: string; start: GridCell; originals: Map<string, MapEditorItem>; previousState: MapEditorState }
  | { kind: 'resize'; itemId: string; start: GridCell; original: MapEditorItem; mode: 'east' | 'south' | 'corner'; previousState: MapEditorState }
  | { kind: 'rotate'; itemId: string; centerX: number; centerY: number; startAngle: number; original: MapEditorItem; previousState: MapEditorState };

const defaultElementSpans: Partial<Record<EditorElementType, { columnSpan: number; rowSpan: number }>> = {
  WALL: { columnSpan: 3, rowSpan: 1 },
  DOOR: { columnSpan: 1, rowSpan: 2 },
  PDU: { columnSpan: 1, rowSpan: 2 },
  CORRIDOR: { columnSpan: 3, rowSpan: 2 },
  COLUMN: { columnSpan: 1, rowSpan: 1 }
};

function withDefaultElementSpan(type: EditorElementType, selection: GridSelection, columnCount: number, rowCount: number): GridSelection {
  const defaultSpan = defaultElementSpans[type];

  if (!defaultSpan || selection.columnSpan > 1 || selection.rowSpan > 1) {
    return selection;
  }

  return {
    ...selection,
    columnSpan: Math.min(defaultSpan.columnSpan, columnCount - selection.columnIndex),
    rowSpan: Math.min(defaultSpan.rowSpan, rowCount - selection.rowIndex)
  };
}

function makeItem(type: EditorElementType, selection: GridSelection): MapEditorItem {
  const base = {
    id: crypto.randomUUID(),
    startColumnIndex: selection.columnIndex,
    startRowIndex: selection.rowIndex,
    columnSpan: selection.columnSpan,
    rowSpan: selection.rowSpan,
    rotation: 0,
    zIndex: type === 'RACK_SLOT' ? 10 : 1,
    label: null
  };

  if (type === 'RACK_SLOT') {
    return {
      ...base,
      type,
      rackName: 'Rack',
      normalizedRowCode: null,
      rackCode: null,
      rackTablesRackId: null,
      rackTablesRackName: null,
      fillColor: null,
      borderColor: null,
      textColor: null
    };
  }

  return {
    ...base,
    type,
    label: type === 'COLUMN' ? 'Coluna' : type,
    fillColor: null,
    borderColor: null,
    textColor: null
  };
}

function allItems(state: MapEditorState) {
  return [...state.rackSlots, ...state.elements];
}

function replaceItems(state: MapEditorState, items: MapEditorItem[]): MapEditorState {
  return {
    ...state,
    rackSlots: items.filter((item): item is Extract<MapEditorItem, { type: 'RACK_SLOT' }> => item.type === 'RACK_SLOT'),
    elements: items.filter((item): item is Exclude<MapEditorItem, { type: 'RACK_SLOT' }> => item.type !== 'RACK_SLOT')
  };
}

function normalizeRotation(rotation: number) {
  return Math.round((rotation % 360 + 360) % 360);
}

function snapRotation(rotation: number) {
  const normalized = normalizeRotation(rotation);

  return (normalized >= 45 && normalized < 135) || (normalized >= 225 && normalized < 315) ? 90 : 0;
}

function angleFromCenter(x: number, y: number, centerX: number, centerY: number) {
  return Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
}

function isVertical(item: MapEditorItem) {
  return item.rowSpan > item.columnSpan;
}

function itemWithRotation(item: MapEditorItem, rotation: 0 | 90) {
  const shouldBeVertical = rotation === 90;

  if (isVertical(item) === shouldBeVertical) {
    return { ...item, rotation: 0 };
  }

  return {
    ...item,
    columnSpan: item.rowSpan,
    rowSpan: item.columnSpan,
    rotation: 0
  };
}

function itemFitsGrid(item: MapEditorItem, state: MapEditorState) {
  return item.startColumnIndex + item.columnSpan <= state.columns.length
    && item.startRowIndex + item.rowSpan <= state.rows.length;
}

export function EditorCanvas({
  state,
  onDraft,
  onCommit,
  setStatus,
  axisHandlers
}: {
  state: MapEditorState;
  onDraft: (state: MapEditorState) => void;
  onCommit: (state: MapEditorState, previousState?: MapEditorState) => void;
  setStatus: (message: string | null) => void;
  axisHandlers: {
    onColumnChange: (columnId: string, code: string) => void;
    onColumnResize: (columnId: string, width: number) => void;
    onColumnMove: (columnId: string, direction: -1 | 1) => void;
    onColumnAdd: () => void;
    onColumnRemove: (columnId: string) => void;
    onRowChange: (rowId: string, code: string) => void;
    onRowResize: (rowId: string, height: number) => void;
    onRowMove: (rowId: string, direction: -1 | 1) => void;
    onRowAdd: () => void;
    onRowRemove: (rowId: string) => void;
  };
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [zoom, setZoom] = useState(1);
  const createSelection = drag?.kind === 'create' ? selectionFromCells(drag.start, drag.current) : null;
  const createPreviewSelection = createSelection && state.activeTool !== 'SELECT' && state.activeTool !== 'ERASER'
    ? withDefaultElementSpan(state.activeTool, createSelection, state.columns.length, state.rows.length)
    : createSelection;
  const items = useMemo(() => allItems(state), [state]);
  const selectionInvalid = useMemo(() => {
    if (!createPreviewSelection || state.activeTool === 'SELECT' || state.activeTool === 'ERASER') {
      return false;
    }

    const candidate = makeItem(state.activeTool, createPreviewSelection);
    return Boolean(findCollision(candidate, items));
  }, [createPreviewSelection, items, state.activeTool]);

  function pointToCell(event: React.PointerEvent<HTMLDivElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return { columnIndex: 0, rowIndex: 0 };
    }

    return cellFromPoint((event.clientX - rect.left) / zoom, (event.clientY - rect.top) / zoom, state.columns, state.rows);
  }

  function pointToCanvas(event: React.PointerEvent<HTMLDivElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (event.clientX - rect.left) / zoom,
      y: (event.clientY - rect.top) / zoom
    };
  }

  function selectedIdsForPointer(itemId: string, event: React.PointerEvent) {
    const selected = event.shiftKey ? Array.from(new Set([...state.selectedElementIds, itemId])) : [itemId];

    return selected;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const itemElement = target.closest<HTMLElement>('[data-editor-item-id]');
    const resizeHandle = target.closest<HTMLElement>('[data-resize-handle]');
    const rotateHandle = target.closest<HTMLElement>('[data-rotate-handle]');
    const cell = pointToCell(event);

    if (itemElement) {
      const itemId = itemElement.dataset.editorItemId!;
      const item = items.find((current) => current.id === itemId);

      if (!item) {
        return;
      }

      if (state.activeTool === 'ERASER') {
        if (item?.type === 'RACK_SLOT' && !window.confirm('Excluir este Rack Slot?')) {
          return;
        }

        const nextItems = items.filter((item) => item.id !== itemId);
        onCommit(replaceItems({ ...state, selectedElementIds: [] }, nextItems));
        return;
      }

      const nextSelectedIds = selectedIdsForPointer(itemId, event);
      onDraft({ ...state, selectedElementIds: nextSelectedIds });

      if (rotateHandle) {
        const pointer = pointToCanvas(event);
        const geometry = itemGeometry(item, state.columns, state.rows);
        const centerX = geometry.left + geometry.width / 2;
        const centerY = geometry.top + geometry.height / 2;

        setDrag({
          kind: 'rotate',
          itemId,
          centerX,
          centerY,
          startAngle: angleFromCenter(pointer.x, pointer.y, centerX, centerY),
          original: structuredClone(item),
          previousState: structuredClone(state)
        });
      } else if (resizeHandle) {
        setDrag({ kind: 'resize', itemId, start: cell, original: structuredClone(item), mode: resizeHandle.dataset.resizeHandle as 'east' | 'south' | 'corner', previousState: structuredClone(state) });
      } else if (state.activeTool === 'SELECT') {
        setDrag({
          kind: 'move',
          itemId,
          start: cell,
          originals: new Map([[item.id, structuredClone(item)]]),
          previousState: structuredClone(state)
        });
      }
      return;
    }

    if (state.activeTool === 'SELECT') {
      onDraft({ ...state, selectedElementIds: [] });
      return;
    }

    if (state.activeTool !== 'ERASER') {
      setDrag({ kind: 'create', start: cell, current: cell });
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag) {
      return;
    }

    const cell = pointToCell(event);

    if (drag.kind === 'create') {
      setDrag({ ...drag, current: cell });
      return;
    }

    if (drag.kind === 'rotate') {
      const pointer = pointToCanvas(event);
      const angle = angleFromCenter(pointer.x, pointer.y, drag.centerX, drag.centerY);
      const rotation = snapRotation(drag.original.rotation + angle - drag.startAngle) as 0 | 90;
      const candidate = itemWithRotation(drag.original, rotation);
      const nextItems = items.map((item) => item.id === drag.itemId ? candidate : item);

      if (!itemFitsGrid(candidate, state) || findCollision(candidate, nextItems)) {
        setStatus('Orientacao bloqueada: o item precisa ficar dentro da grade e sem sobreposicao.');
        return;
      }

      onDraft(replaceItems(state, nextItems));
      setStatus(null);
      return;
    }

    const columnDelta = cell.columnIndex - drag.start.columnIndex;
    const rowDelta = cell.rowIndex - drag.start.rowIndex;

    if (drag.kind === 'move') {
      const nextItems = items.map((item) => {
        const original = drag.originals.get(item.id);

        if (!original) {
          return item;
        }

        return clampGridItem({
          ...item,
          startColumnIndex: original.startColumnIndex + columnDelta,
          startRowIndex: original.startRowIndex + rowDelta
        }, state.columns.length, state.rows.length) as MapEditorItem;
      });
      onDraft(replaceItems(state, nextItems));
      return;
    }

    const nextItems = items.map((item) => {
      if (item.id !== drag.itemId) {
        return item;
      }

      return clampGridItem({
        ...item,
        columnSpan: drag.mode === 'south' ? item.columnSpan : Math.max(1, drag.original.columnSpan + columnDelta),
        rowSpan: drag.mode === 'east' ? item.rowSpan : Math.max(1, drag.original.rowSpan + rowDelta)
      }, state.columns.length, state.rows.length) as MapEditorItem;
    });
    onDraft(replaceItems(state, nextItems));
  }

  function handlePointerUp() {
    if (!drag) {
      return;
    }

    if (drag.kind === 'create') {
      const selection = withDefaultElementSpan(
        state.activeTool as EditorElementType,
        selectionFromCells(drag.start, drag.current),
        state.columns.length,
        state.rows.length
      );
      const item = makeItem(state.activeTool as EditorElementType, selection);
      const collision = findCollision(item, items);

      if (collision) {
        setStatus(getCollisionMessage(item, collision));
      } else {
        const nextItems = [...items, item];
        onCommit(replaceItems({ ...state, selectedElementIds: [item.id], activeTool: item.type === 'RACK_SLOT' ? 'SELECT' : state.activeTool }, nextItems));
        setStatus(item.type === 'RACK_SLOT' ? 'Informe o nome do rack e, se desejar, vincule ao RackTables no painel.' : null);
      }
    } else if (drag.kind === 'rotate') {
      onCommit(state, drag.previousState);
      setStatus(null);
    } else {
      const changedItem = allItems(state).find((item) => item.id === drag.itemId);
      const collision = changedItem ? findCollision(changedItem, allItems(state)) : undefined;

      if (collision) {
        setStatus('Movimento bloqueado por conflito de celulas.');
        const originalItems = drag.kind === 'move'
          ? items.map((item) => drag.originals.get(item.id) ?? item)
          : drag.kind === 'resize'
            ? items.map((item) => item.id === drag.itemId ? drag.original : item)
            : items;
        onDraft(replaceItems(state, originalItems));
      } else {
        onCommit(state, drag.previousState);
        setStatus(null);
      }
    }

    setDrag(null);
  }

  return (
    <section className="map-editor-canvas-wrap">
      <div className="map-editor-zoom">
        <button type="button" onClick={() => setZoom((value) => Math.max(0.5, value - 0.1))}>-</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => setZoom((value) => Math.min(2, value + 0.1))}>+</button>
      </div>
      <div className="map-editor-scroll">
        <div className="map-editor-board" style={{ transform: `scale(${zoom})` }}>
          <div className="map-editor-corner" />
          <ColumnHeaders
            columns={state.columns}
            onAdd={axisHandlers.onColumnAdd}
            onChange={axisHandlers.onColumnChange}
            onMove={axisHandlers.onColumnMove}
            onRemove={axisHandlers.onColumnRemove}
            onResize={axisHandlers.onColumnResize}
          />
          <RowHeaders
            rows={state.rows}
            onAdd={axisHandlers.onRowAdd}
            onChange={axisHandlers.onRowChange}
            onMove={axisHandlers.onRowMove}
            onRemove={axisHandlers.onRowRemove}
            onResize={axisHandlers.onRowResize}
          />
          <div
            className="map-editor-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={canvasRef}
            style={{ width: totalWidth(state.columns), height: totalHeight(state.rows) }}
          >
            <GridLayer columns={state.columns} rows={state.rows} />
            {state.elements.map((element) => (
              <FixedMapElement columns={state.columns} element={element} key={element.id} rows={state.rows} selected={state.selectedElementIds.includes(element.id)} />
            ))}
            {state.rackSlots.map((slot) => (
              <RackSlotElement columns={state.columns} key={slot.id} rows={state.rows} selected={state.selectedElementIds.includes(slot.id)} slot={slot} />
            ))}
            <SelectionOverlay columns={state.columns} invalid={selectionInvalid} rows={state.rows} selection={createPreviewSelection} />
          </div>
        </div>
      </div>
    </section>
  );
}
