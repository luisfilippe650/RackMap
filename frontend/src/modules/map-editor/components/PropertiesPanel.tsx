import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Field, SelectInput, TextInput } from '../../../components/ui/field';
import type { EditorElementType, MapEditorItem, MapEditorState } from '../map-editor.types';
import { rackTablesApi, type RackTablesRackOption } from '../services/racktables.api';
import { findCollision } from '../utils/collision-detection';

const fixedTypes: EditorElementType[] = ['PDU', 'WALL', 'DOOR', 'CORRIDOR', 'COLUMN'];

function clampSpan(value: number, startIndex: number, total: number) {
  const maxSpan = Math.max(1, total - startIndex);
  const normalizedValue = Number.isFinite(value) ? Math.floor(value) : 1;

  return Math.min(Math.max(1, normalizedValue), maxSpan);
}

function isVertical(item: MapEditorItem) {
  return item.rowSpan > item.columnSpan;
}

function itemWithOrientation(item: MapEditorItem, orientation: 'horizontal' | 'vertical') {
  const shouldBeVertical = orientation === 'vertical';

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

function allItems(state: MapEditorState) {
  return [...state.rackSlots, ...state.elements];
}

export function PropertiesPanel({
  state,
  selectedItem,
  onChangeItem,
  onDeleteSelected
}: {
  state: MapEditorState;
  selectedItem: MapEditorItem | null;
  onChangeItem: (item: MapEditorItem) => void;
  onDeleteSelected: () => void;
}) {
  const [rackSearch, setRackSearch] = useState('');
  const [rackOptions, setRackOptions] = useState<RackTablesRackOption[]>([]);
  const [rackSearchStatus, setRackSearchStatus] = useState<string | null>(null);

  const filteredRackOptions = useMemo(() => {
    const normalizedSearch = rackSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return rackOptions.slice(0, 100);
    }

    return rackOptions.filter((rack) => [
      rack.name,
      String(rack.id),
      rack.rowCode,
      rack.rackCode,
      rack.locationName
    ].some((value) => value?.toLowerCase().includes(normalizedSearch))).slice(0, 100);
  }, [rackOptions, rackSearch]);

  async function searchRackTablesRacks() {
    setRackSearchStatus('Buscando racks...');

    try {
      const racks = await rackTablesApi.listRacks();
      setRackOptions(racks);
      setRackSearchStatus(racks.length === 0 ? 'Nenhum rack encontrado.' : null);
    } catch (error) {
      setRackSearchStatus(error instanceof Error ? error.message : 'Falha ao buscar racks.');
    }
  }

  useEffect(() => {
    if (selectedItem?.type !== 'RACK_SLOT') {
      return;
    }

    setRackSearch('');
    void searchRackTablesRacks();
  }, [selectedItem?.id, selectedItem?.type]);

  function linkRackTablesRack(rack: RackTablesRackOption | undefined) {
    if (!selectedItem || selectedItem.type !== 'RACK_SLOT') {
      return;
    }

    if (!rack) {
      onChangeItem({
        ...selectedItem,
        rackTablesRackId: null,
        rackTablesRackName: null,
        rackTablesRackData: undefined
      });
      setRackSearchStatus('Vinculo removido.');
      return;
    }

    onChangeItem({
      ...selectedItem,
      rackName: selectedItem.rackName || rack.name,
      normalizedRowCode: rack.rowCode ?? selectedItem.normalizedRowCode,
      rackCode: rack.rackCode ?? selectedItem.rackCode,
      rackTablesRackId: String(rack.id),
      rackTablesRackName: rack.name,
      rackTablesRackData: rack.raw
    });
    setRackSearchStatus(`Vinculado a ${rack.name}.`);
  }

  function changeSelectedSize(axis: 'width' | 'height', value: number) {
    if (!selectedItem) {
      return;
    }

    const candidate = axis === 'width'
      ? {
        ...selectedItem,
        columnSpan: clampSpan(value, selectedItem.startColumnIndex, state.columns.length)
      }
      : {
        ...selectedItem,
        rowSpan: clampSpan(value, selectedItem.startRowIndex, state.rows.length)
      };
    const nextItems = allItems(state).map((item) => item.id === selectedItem.id ? candidate : item);

    if (findCollision(candidate, nextItems)) {
      return;
    }

    if (axis === 'width') {
      onChangeItem(candidate);
      return;
    }

    onChangeItem(candidate);
  }

  function canUseOrientation(orientation: 'horizontal' | 'vertical') {
    if (!selectedItem) {
      return false;
    }

    const candidate = itemWithOrientation(selectedItem, orientation);
    const nextItems = allItems(state).map((item) => item.id === selectedItem.id ? candidate : item);

    return itemFitsGrid(candidate, state) && !findCollision(candidate, nextItems);
  }

  function changeSelectedOrientation(orientation: 'horizontal' | 'vertical') {
    if (!selectedItem) {
      return;
    }

    const candidate = itemWithOrientation(selectedItem, orientation);
    const nextItems = allItems(state).map((item) => item.id === selectedItem.id ? candidate : item);

    if (!itemFitsGrid(candidate, state) || findCollision(candidate, nextItems)) {
      return;
    }

    onChangeItem(candidate);
  }

  if (!selectedItem) {
    return (
      <aside className="map-editor-properties">
        <h2>Propriedades</h2>
        <p className="muted-text">Selecione um elemento na grade.</p>
        <div className="metric-list">
          <span>Colunas</span>
          <strong>{state.columns.length}</strong>
          <span>Linhas</span>
          <strong>{state.rows.length}</strong>
          <span>Itens</span>
          <strong>{state.rackSlots.length + state.elements.length}</strong>
        </div>
      </aside>
    );
  }

  return (
    <aside className="map-editor-properties">
      <h2>Propriedades</h2>
      <div className="form-grid single">
        <Field label="Rotulo">
          <TextInput value={selectedItem.label ?? ''} onChange={(event) => onChangeItem({ ...selectedItem, label: event.target.value || null })} />
        </Field>

        {selectedItem.type === 'RACK_SLOT' ? (
          <>
            <Field label="Nome no mapa">
              <TextInput value={selectedItem.rackName} onChange={(event) => onChangeItem({ ...selectedItem, rackName: event.target.value })} />
            </Field>
            <Field label="Buscar RackTables">
              <div className="racktables-link-controls">
                <TextInput value={rackSearch} onChange={(event) => setRackSearch(event.target.value)} placeholder="pesquisar por nome" />
                <Button onClick={searchRackTablesRacks}>Atualizar</Button>
              </div>
            </Field>
            {selectedItem.rackTablesRackId ? (
              <div className="properties-box compact">
                <dl>
                  <dt>RackTables</dt>
                  <dd>{selectedItem.rackTablesRackName ?? selectedItem.rackTablesRackId}</dd>
                  <dt>ID</dt>
                  <dd>{selectedItem.rackTablesRackId}</dd>
                </dl>
                <Button onClick={() => onChangeItem({ ...selectedItem, rackTablesRackId: null, rackTablesRackName: null, rackTablesRackData: undefined })}>
                  Desvincular
                </Button>
              </div>
            ) : null}
            {rackSearchStatus ? <p className="muted-text">{rackSearchStatus}</p> : null}
            {filteredRackOptions.length > 0 ? (
              <div className="racktables-results" role="listbox" aria-label="Racks da API">
                {filteredRackOptions.map((rack) => {
                  const selected = selectedItem.rackTablesRackId === String(rack.id);

                  return (
                    <button
                      className={selected ? 'selected' : ''}
                      key={String(rack.id)}
                      type="button"
                      onClick={() => linkRackTablesRack(rack)}
                    >
                      <strong>{rack.name}</strong>
                      <span>{rack.locationName ?? 'RackTables'} {rack.rowCode && rack.rackCode ? `${rack.rowCode}-${rack.rackCode}` : `ID ${rack.id}`}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {rackOptions.length > 0 && filteredRackOptions.length === 0 ? <p className="muted-text">Nenhum rack encontrado com esse filtro.</p> : null}
          </>
        ) : (
          <Field label="Tipo">
            <SelectInput value={selectedItem.type} onChange={(event) => onChangeItem({ ...selectedItem, type: event.target.value as Exclude<EditorElementType, 'RACK_SLOT'> })}>
              {fixedTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </SelectInput>
          </Field>
        )}

        <Field label="Orientacao">
          <SelectInput
            value={isVertical(selectedItem) ? 'vertical' : 'horizontal'}
            onChange={(event) => changeSelectedOrientation(event.target.value as 'horizontal' | 'vertical')}
          >
            <option disabled={!canUseOrientation('horizontal')} value="horizontal">Horizontal</option>
            <option disabled={!canUseOrientation('vertical')} value="vertical">Vertical</option>
          </SelectInput>
        </Field>
        <Field label="Z-index">
          <TextInput type="number" value={selectedItem.zIndex} onChange={(event) => onChangeItem({ ...selectedItem, zIndex: Number(event.target.value) })} />
        </Field>
        <Field label="Largura">
          <TextInput
            min={1}
            max={Math.max(1, state.columns.length - selectedItem.startColumnIndex)}
            type="number"
            value={selectedItem.columnSpan}
            onChange={(event) => changeSelectedSize('width', Number(event.target.value))}
          />
        </Field>
        <Field label="Altura">
          <TextInput
            min={1}
            max={Math.max(1, state.rows.length - selectedItem.startRowIndex)}
            type="number"
            value={selectedItem.rowSpan}
            onChange={(event) => changeSelectedSize('height', Number(event.target.value))}
          />
        </Field>

        <Field label="Cor de fundo">
          <TextInput type="color" value={selectedItem.fillColor ?? (selectedItem.type === 'RACK_SLOT' ? '#dcebed' : '#e2e8f0')} onChange={(event) => onChangeItem({ ...selectedItem, fillColor: event.target.value })} />
        </Field>
        <Field label="Borda">
          <TextInput type="color" value={selectedItem.borderColor ?? (selectedItem.type === 'RACK_SLOT' ? '#15616d' : '#94a3b8')} onChange={(event) => onChangeItem({ ...selectedItem, borderColor: event.target.value })} />
        </Field>
        <Field label="Texto">
          <TextInput type="color" value={selectedItem.textColor ?? (selectedItem.type === 'RACK_SLOT' ? '#0f4d57' : '#0f172a')} onChange={(event) => onChangeItem({ ...selectedItem, textColor: event.target.value })} />
        </Field>

        <div className="properties-box compact">
          <dl>
            <dt>Coluna</dt>
            <dd>{selectedItem.startColumnIndex}</dd>
            <dt>Linha</dt>
            <dd>{selectedItem.startRowIndex}</dd>
            <dt>Span</dt>
            <dd>{selectedItem.columnSpan} x {selectedItem.rowSpan}</dd>
          </dl>
        </div>

        <Button variant="danger" onClick={onDeleteSelected}>
          <Trash2 size={16} />
          Excluir
        </Button>
      </div>
    </aside>
  );
}
