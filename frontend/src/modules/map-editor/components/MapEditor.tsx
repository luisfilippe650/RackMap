import { ArrowLeft, RotateCcw, Save, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { useEditorHistory } from '../hooks/useEditorHistory';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useSaveMapEditor, useSelectedItems } from '../hooks/useMapEditor';
import type { EditorColumn, EditorRow, MapEditorItem, MapEditorState, NetworkLinkDraft } from '../map-editor.types';
import { findCollision, getCollisionMessage } from '../utils/collision-detection';
import { defaultColumnCode, defaultRowCode } from '../utils/axis-labels';
import { clampGridItem } from '../utils/grid-coordinates';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { PropertiesPanel } from './PropertiesPanel';

function reorder<T extends { id: string; order: number }>(items: T[], itemId: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === itemId);
  const nextIndex = index + direction;

  if (index < 0 || nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, item);

  return nextItems.map((current, order) => ({ ...current, order }));
}

function updateItems(state: MapEditorState, updater: (item: MapEditorItem) => MapEditorItem) {
  return {
    ...state,
    rackSlots: state.rackSlots.map((slot) => updater(slot)).filter((item): item is MapEditorState['rackSlots'][number] => item.type === 'RACK_SLOT'),
    elements: state.elements.map((element) => updater(element)).filter((item): item is MapEditorState['elements'][number] => item.type !== 'RACK_SLOT')
  };
}

function clampAllItems(state: MapEditorState) {
  return updateItems(state, (item) => clampGridItem(item, state.columns.length, state.rows.length) as MapEditorItem);
}

function rowsUseDefaultNumericCodes(rows: EditorRow[]) {
  return rows.every((row) => /^\d+$/.test(row.code));
}

function renumberRowsFromBottom(rows: EditorRow[]) {
  return rows.map((row, order) => ({
    ...row,
    code: defaultRowCode(order, rows.length),
    order
  }));
}

export function MapEditor({ initialState, mapId }: { initialState: MapEditorState; mapId: number }) {
  const navigate = useNavigate();
  const history = useEditorHistory(initialState);
  const saveEditor = useSaveMapEditor(mapId);
  const [status, setStatus] = useState<string | null>(null);
  const selectedItems = useSelectedItems(history.state);
  const selectedItem = selectedItems[0] ?? null;
  const selectedNetworkLink = history.state.networkLinks.find((link) => link.id === history.state.selectedNetworkLinkId) ?? null;

  const draft = (nextState: MapEditorState) => history.setState({ ...nextState, isDirty: true });
  const commit = (nextState: MapEditorState, previousState?: MapEditorState) => history.commit({ ...nextState, isDirty: true }, previousState);

  function deleteSelected() {
    if (history.state.selectedElementIds.length === 0 && !history.state.selectedNetworkLinkId) {
      return;
    }

    const selected = new Set(history.state.selectedElementIds);
    const selectedNetworkLinkId = history.state.selectedNetworkLinkId;
    const importantDelete = history.state.selectedElementIds.length > 1 || history.state.rackSlots.some((slot) => selected.has(slot.id));

    if (importantDelete && !window.confirm('Excluir os elementos selecionados?')) {
      return;
    }

    commit({
      ...history.state,
      rackSlots: history.state.rackSlots.filter((slot) => !selected.has(slot.id)),
      elements: history.state.elements.filter((element) => !selected.has(element.id)),
      networkLinks: history.state.networkLinks.filter((link) => (
        link.id !== selectedNetworkLinkId
        && !selected.has(link.sourceRackSlotId)
        && !selected.has(link.targetRackSlotId)
      )),
      selectedElementIds: [],
      selectedNetworkLinkId: null
    });
  }

  useKeyboardShortcuts({
    onUndo: history.undo,
    onRedo: history.redo,
    onDelete: deleteSelected
  });

  const axisHandlers = useMemo(() => ({
    onColumnChange: (columnId: string, code: string) => draft({ ...history.state, columns: history.state.columns.map((column) => column.id === columnId ? { ...column, code } : column) }),
    onColumnResize: (columnId: string, width: number) => draft({ ...history.state, columns: history.state.columns.map((column) => column.id === columnId ? { ...column, width } : column) }),
    onColumnMove: (columnId: string, direction: -1 | 1) => commit({ ...history.state, columns: reorder(history.state.columns, columnId, direction) }),
    onColumnAdd: () => commit({
      ...history.state,
      map: { ...history.state.map, columnCount: history.state.columns.length + 1 },
      columns: [...history.state.columns, { id: crypto.randomUUID(), code: defaultColumnCode(history.state.columns.length), order: history.state.columns.length, width: 64 } satisfies EditorColumn]
    }),
    onColumnRemove: (columnId: string) => {
      if (history.state.columns.length <= 1) {
        return;
      }
      commit(clampAllItems({
        ...history.state,
        map: { ...history.state.map, columnCount: history.state.columns.length - 1 },
        columns: history.state.columns.filter((column) => column.id !== columnId).map((column, order) => ({ ...column, order }))
      }));
    },
    onRowChange: (rowId: string, code: string) => draft({ ...history.state, rows: history.state.rows.map((row) => row.id === rowId ? { ...row, code } : row) }),
    onRowResize: (rowId: string, height: number) => draft({ ...history.state, rows: history.state.rows.map((row) => row.id === rowId ? { ...row, height } : row) }),
    onRowMove: (rowId: string, direction: -1 | 1) => commit({ ...history.state, rows: reorder(history.state.rows, rowId, direction) }),
    onRowAdd: () => {
      const rows = [
        ...history.state.rows,
        { id: crypto.randomUUID(), code: defaultRowCode(history.state.rows.length, history.state.rows.length + 1), order: history.state.rows.length, height: 32 } satisfies EditorRow
      ];

      commit({
        ...history.state,
        map: { ...history.state.map, rowCount: rows.length },
        rows: rowsUseDefaultNumericCodes(history.state.rows) ? renumberRowsFromBottom(rows) : rows
      });
    },
    onRowRemove: (rowId: string) => {
      if (history.state.rows.length <= 1) {
        return;
      }
      commit(clampAllItems({
        ...history.state,
        map: { ...history.state.map, rowCount: history.state.rows.length - 1 },
        rows: rowsUseDefaultNumericCodes(history.state.rows)
          ? renumberRowsFromBottom(history.state.rows.filter((row) => row.id !== rowId))
          : history.state.rows.filter((row) => row.id !== rowId).map((row, order) => ({ ...row, order }))
      }));
    }
  }), [history.state]);

  function changeSelectedItem(item: MapEditorItem) {
    draft(updateItems(history.state, (current) => current.id === item.id ? item : current));
  }

  function changeSelectedNetworkLink(link: NetworkLinkDraft) {
    draft({
      ...history.state,
      networkLinks: history.state.networkLinks.map((current) => current.id === link.id ? link : current)
    });
  }

  async function save() {
    setStatus(null);

    const incompleteSlot = history.state.rackSlots.find((slot) => !slot.rackName.trim());

    if (incompleteSlot) {
      setStatus('Rack precisa de um nome antes de salvar.');
      history.setState({ ...history.state, selectedElementIds: [incompleteSlot.id] });
      return;
    }

    const incompleteNetworkLink = history.state.networkLinks.find((link) => !link.name.trim());

    if (incompleteNetworkLink) {
      setStatus('Fio de rede precisa de um nome antes de salvar.');
      history.setState({ ...history.state, selectedElementIds: [], selectedNetworkLinkId: incompleteNetworkLink.id });
      return;
    }

    const items = [...history.state.rackSlots, ...history.state.elements];
    const collided = items.find((item) => findCollision(item, items));

    if (collided) {
      setStatus(getCollisionMessage(collided, findCollision(collided, items)) ?? 'Existem elementos incompativeis sobrepostos.');
      history.setState({ ...history.state, selectedElementIds: [collided.id] });
      return;
    }

    try {
      await saveEditor.mutateAsync(history.state);
      history.setState({ ...history.state, isDirty: false });
      setStatus('Salvo.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Falha ao salvar.');
    }
  }

  return (
    <section className="map-editor-shell-v2">
      <header className="map-editor-topbar">
        <div className="map-editor-title-row">
          <button className="icon-button" type="button" title="Voltar" aria-label="Voltar" onClick={() => navigate(`/maps/${mapId}/view`)}>
            <ArrowLeft size={16} />
          </button>
          <div className="map-editor-title-fields">
            <input
              aria-label="Nome do mapa"
              value={history.state.map.name}
              onChange={(event) => draft({ ...history.state, map: { ...history.state.map, name: event.target.value } })}
            />
            <textarea
              aria-label="Descricao do mapa"
              placeholder="Descricao do mapa"
              rows={2}
              value={history.state.map.description ?? ''}
              onChange={(event) => draft({ ...history.state, map: { ...history.state.map, description: event.target.value || null } })}
            />
          </div>
        </div>
        <div className="map-editor-topbar-actions">
          <Button disabled={!history.canUndo} onClick={history.undo}>
            <Undo2 size={16} />
            Desfazer
          </Button>
          <Button disabled={!history.canRedo} onClick={history.redo}>
            <RotateCcw size={16} />
            Refazer
          </Button>
          <Button disabled={saveEditor.isPending} onClick={save} variant="primary">
            <Save size={16} />
            Salvar
          </Button>
        </div>
      </header>

      <EditorToolbar activeTool={history.state.activeTool} onToolChange={(activeTool) => draft({ ...history.state, activeTool })} />
      <EditorCanvas axisHandlers={axisHandlers} onCommit={commit} onDraft={draft} setStatus={setStatus} state={history.state} />
      <div className={`map-editor-status ${status ? 'has-message' : ''}`}>
        {status ?? (history.state.isDirty ? 'Alteracoes locais nao salvas.' : 'Sem alteracoes pendentes.')}
      </div>
      <PropertiesPanel
        onChangeItem={changeSelectedItem}
        onChangeNetworkLink={changeSelectedNetworkLink}
        onDeleteSelected={deleteSelected}
        selectedItem={selectedItem}
        selectedNetworkLink={selectedNetworkLink}
        state={history.state}
      />
    </section>
  );
}
