import { Cable, Edit3, Grid2X2, Minus, Plus, Printer, RefreshCcw, RotateCcw, Tags, X, Rows3 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingState } from '../../components/feedback/loading-state';
import { Button } from '../../components/ui/button';
import { RenderedMapCanvas } from '../../modules/rendering/rendered-map-canvas';
import { useRenderedMap } from '../../modules/rendering/use-rendered-map';
import { rackTablesApi, type RackTablesAllocatedObject, type RackTablesObjectSummaryResponse, type RackTablesOccupancyResponse } from '../../modules/map-editor/services/racktables.api';
import type { RenderedRack } from '../../types/rackmap';

function parseMapId(value?: string) {
  return Number(value ?? Number.NaN);
}

function formatSummaryValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'object') {
    if ('value' in value && Object.keys(value).length === 1) {
      return formatSummaryValue((value as { value?: unknown }).value);
    }

    return JSON.stringify(value);
  }

  return String(value);
}

export function MapViewPage() {
  const { mapId: mapIdParam } = useParams();
  const mapId = parseMapId(mapIdParam);
  const renderedMapQuery = useRenderedMap(mapId);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [showNetworkOnly, setShowNetworkOnly] = useState(false);
  const [selectedNetworkLinkId, setSelectedNetworkLinkId] = useState<string>('ALL');
  const [selectedRack, setSelectedRack] = useState<RenderedRack | null>(null);
  const [rackOccupancy, setRackOccupancy] = useState<RackTablesOccupancyResponse | null>(null);
  const [rackDetailsStatus, setRackDetailsStatus] = useState<string | null>(null);
  const [selectedObjectSummary, setSelectedObjectSummary] = useState<RackTablesObjectSummaryResponse | null>(null);
  const [objectSummaryStatus, setObjectSummaryStatus] = useState<string | null>(null);
  const [printDateTime, setPrintDateTime] = useState(() => new Date());

  async function selectRack(rack: RenderedRack) {
    setSelectedRack(rack);
    setRackOccupancy(null);
    setSelectedObjectSummary(null);
    setObjectSummaryStatus(null);

    if (!rack.rackTablesRackId) {
      setRackDetailsStatus('Rack manual sem vinculo com RackTables.');
      return;
    }

    setRackDetailsStatus('Carregando ocupacao do RackTables...');

    try {
      setRackOccupancy(await rackTablesApi.getRackOccupancy(rack.rackTablesRackId));
      setRackDetailsStatus(null);
    } catch (error) {
      setRackDetailsStatus(error instanceof Error ? error.message : 'Falha ao carregar RackTables.');
    }
  }

  async function selectServer(object: RackTablesAllocatedObject) {
    if (!object.object_id) {
      setObjectSummaryStatus('Servidor sem ID para buscar detalhes.');
      return;
    }

    setSelectedObjectSummary(null);
    setObjectSummaryStatus('Carregando detalhes do servidor...');

    try {
      setSelectedObjectSummary(await rackTablesApi.getObjectSummary(object.object_id));
      setObjectSummaryStatus(null);
    } catch (error) {
      setObjectSummaryStatus(error instanceof Error ? error.message : 'Falha ao carregar detalhes do servidor.');
    }
  }

  function printMap() {
    const printedAt = new Date();

    setPrintDateTime(printedAt);
    setShowGrid(true);
    setShowAxes(true);
    setShowLabels(true);
    setZoom(1);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.print();
      });
    });
  }

  if (renderedMapQuery.isLoading) {
    return <LoadingState label="Renderizando planta" />;
  }

  if (renderedMapQuery.isError) {
    return <section className="page-panel">{renderedMapQuery.error.message}</section>;
  }

  if (!renderedMapQuery.data) {
    return <section className="page-panel">Mapa nao encontrado</section>;
  }

  const renderedMap = renderedMapQuery.data;
  const allocatedObjects = rackOccupancy?.data?.allocated_objects ?? [];
  const rackUnits = rackOccupancy?.data?.units ?? [];
  const freeUnits = rackOccupancy?.data?.free_units ?? [];
  const selectedSummary = selectedObjectSummary?.data;
  const summaryFields = selectedSummary ? [
    ['Nome', selectedSummary.common_name],
    ['Rotulo', selectedSummary.visible_label],
    ['Asset tag', selectedSummary.asset_tag],
    ['Local', selectedSummary.location_name],
    ['Row', selectedSummary.row_name],
    ['Rack', selectedSummary.rack_name],
    ['Status', selectedSummary.allocation_status],
    ['Problemas', selectedSummary.has_problems],
    ['Comentario', selectedSummary.comment],
  ] as const : [];
  const summaryAttributes = selectedSummary?.attributes ? Object.entries(selectedSummary.attributes) : [];
  const selectedRackDisplayName = selectedRack?.label ?? selectedRack?.rackTablesRackName ?? selectedRack?.name;
  const networkLinks = renderedMap.networkLinks ?? [];
  const filteredNetworkLinks = selectedNetworkLinkId === 'ALL'
    ? networkLinks
    : networkLinks.filter((link) => String(link.id) === selectedNetworkLinkId);

  return (
    <section className="viewer-shell">
      <div className="print-meta">
        <strong>{renderedMap.map.name}</strong>
        <span>{printDateTime.toLocaleDateString('pt-BR')} {printDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      {selectedRack ? (
        <div className="rack-popup" role="dialog" aria-modal="false" aria-label="Rack selecionado">
          <div className="rack-popup-header">
            <div>
              <strong>{selectedRackDisplayName}</strong>
              <span>{selectedRack.rackTablesRackName ?? 'Rack manual'}</span>
            </div>
            <button type="button" onClick={() => setSelectedRack(null)} aria-label="Fechar">
              <X size={16} />
            </button>
          </div>

          <div className="rack-popup-metrics">
            <div>
              <span>Unidades</span>
              <strong>{rackOccupancy?.data?.total_units ?? '-'}</strong>
            </div>
            <div>
              <span>Ocupadas</span>
              <strong>{rackOccupancy?.data?.occupied_units?.length ?? '-'}</strong>
            </div>
            <div>
              <span>Servidores</span>
              <strong>{allocatedObjects.length}</strong>
            </div>
          </div>

          {rackDetailsStatus ? <p>{rackDetailsStatus}</p> : null}

          <div className="rack-popup-body">
            <section className="rack-popup-units">
              {rackUnits.length > 0 ? (
                <div className="rack-popup-list">
                  {rackUnits.map((unit) => (
                    unit.object ? (
                      <button key={`unit-${unit.unit_no}`} type="button" onClick={() => selectServer(unit.object!)}>
                        <strong className="rack-unit-label">U {unit.unit_no}</strong>
                        <span className="rack-unit-info">
                          <strong>{unit.object.object_name ?? `Servidor ${unit.object.object_id}`}</strong>
                          <span>
                            Ocupa U {unit.object.units?.join(', ') ?? unit.unit_no}
                            {unit.object.service_tag ? ` | Tag ${unit.object.service_tag}` : ''}
                          </span>
                        </span>
                      </button>
                    ) : (
                      <div className="free" key={`unit-${unit.unit_no}`}>
                        <strong className="rack-unit-label">U {unit.unit_no}</strong>
                        <span className="rack-unit-info">Espaco livre</span>
                      </div>
                    )
                  ))}
                </div>
              ) : freeUnits.length > 0 ? (
                <div className="rack-popup-list">
                  {freeUnits.map((unit) => (
                    <div className="free" key={`free-${unit}`}>
                      <strong className="rack-unit-label">U {unit}</strong>
                      <span className="rack-unit-info">Espaco livre</span>
                    </div>
                  ))}
                </div>
              ) : !rackDetailsStatus && selectedRack.rackTablesRackId ? (
                <p>Nenhum servidor alocado neste rack.</p>
              ) : null}
            </section>

            <aside className="rack-popup-summary">
              <h3>Detalhes do servidor</h3>
              {objectSummaryStatus ? <p>{objectSummaryStatus}</p> : null}
              {selectedSummary ? (
                <dl>
                  {summaryFields.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{formatSummaryValue(value)}</dd>
                    </div>
                  ))}
                  {summaryAttributes.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{formatSummaryValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : !objectSummaryStatus ? (
                <p>Selecione um servidor para ver os detalhes.</p>
              ) : null}
            </aside>
          </div>
        </div>
      ) : null}

      <div className="viewer-content">
        <div className="viewer-map-panel">
          <header className="editor-toolbar viewer-toolbar">
            <Link className="icon-button" title="Editar mapa" to={`/maps/${mapId}/edit`}>
              <Edit3 size={16} />
            </Link>
            <Button onClick={() => renderedMapQuery.refetch()}>
              <RefreshCcw size={16} />
              Atualizar
            </Button>
            <Button onClick={() => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(2))))}>
              <Plus size={16} />
              Zoom
            </Button>
            <Button onClick={() => setZoom((value) => Math.max(0.4, Number((value - 0.1).toFixed(2))))}>
              <Minus size={16} />
              Zoom
            </Button>
            <Button onClick={() => setZoom(1)}>
              <RotateCcw size={16} />
              Centralizar
            </Button>
            <Button onClick={printMap}>
              <Printer size={16} />
              Imprimir
            </Button>
            <Button variant={showGrid ? 'primary' : 'secondary'} onClick={() => setShowGrid((value) => !value)}>
              <Grid2X2 size={16} />
              Grade
            </Button>
            <Button variant={showLabels ? 'primary' : 'secondary'} onClick={() => setShowLabels((value) => !value)}>
              <Tags size={16} />
              Rotulos
            </Button>
            <Button variant={showAxes ? 'primary' : 'secondary'} onClick={() => setShowAxes((value) => !value)}>
              <Rows3 size={16} />
              Eixos
            </Button>
            <Button variant={showNetworkOnly ? 'primary' : 'secondary'} onClick={() => setShowNetworkOnly((value) => !value)}>
              <Cable size={16} />
              Fiacao
            </Button>
          </header>
          <RenderedMapCanvas
            networkLinks={filteredNetworkLinks}
            onRackClick={selectRack}
            renderedMap={renderedMap}
            showAxes={showAxes}
            showGrid={showGrid}
            showLabels={showLabels}
            showNetworkOnly={showNetworkOnly}
            zoom={zoom}
          />
        </div>
        <aside className="viewer-sidebar">
          <div>
            <h2>{renderedMap.map.name}</h2>
            {renderedMap.map.description ? <p className="map-description">{renderedMap.map.description}</p> : null}
          </div>
          {showNetworkOnly ? (
            <section className="network-filter-panel">
              <div className="network-filter-heading">
                <h3>Fiacao</h3>
                <span>{filteredNetworkLinks.length}/{networkLinks.length}</span>
              </div>
              <label className="network-filter-select">
                <span>Rede</span>
                <select value={selectedNetworkLinkId} onChange={(event) => setSelectedNetworkLinkId(event.target.value)}>
                  <option value="ALL">Todas as redes</option>
                  {networkLinks.map((link) => (
                    <option key={link.id} value={String(link.id)}>
                      {link.name}{link.cableType ? ` - ${link.cableType}` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <div className="network-link-list" role="listbox" aria-label="Redes cadastradas">
                <button className={selectedNetworkLinkId === 'ALL' ? 'selected' : ''} type="button" onClick={() => setSelectedNetworkLinkId('ALL')}>
                  <strong>Todas as redes</strong>
                  <span>{networkLinks.length} fios cadastrados</span>
                </button>
                {networkLinks.map((link) => (
                  <button
                    className={selectedNetworkLinkId === String(link.id) ? 'selected' : ''}
                    key={link.id}
                    type="button"
                    onClick={() => setSelectedNetworkLinkId(String(link.id))}
                  >
                    <strong>{link.name}</strong>
                    <span>{link.cableType ?? 'Sem tipo'} | {link.pathPoints.length} pontos</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
          <div className="metric-list">
            <span>Racks posicionados</span>
            <strong>{renderedMap.racks.length}</strong>
            <span>Vinculados</span>
            <strong>{renderedMap.racks.filter((rack) => rack.rackTablesRackId).length}</strong>
            <span>Fios</span>
            <strong>{networkLinks.length}</strong>
            {showNetworkOnly ? (
              <>
                <span>Exibidos</span>
                <strong>{filteredNetworkLinks.length}</strong>
              </>
            ) : null}
            <span>Conflitos</span>
            <strong>{renderedMap.conflicts.length}</strong>
          </div>
          {showNetworkOnly && filteredNetworkLinks.length === 0 ? (
            <section className="issue-list">
              <h3>Fiacao</h3>
              <p>Nenhuma rede encontrada para esse filtro.</p>
            </section>
          ) : null}
          {renderedMap.warnings && renderedMap.warnings.length > 0 ? (
            <section className="issue-list">
              <h3>Avisos</h3>
              {renderedMap.warnings.map((warning, index) => (
                <p key={`${warning.type}-${warning.rowCode ?? index}`}>{warning.message}</p>
              ))}
            </section>
          ) : null}

          {renderedMap.conflicts.length > 0 ? (
            <section className="issue-list">
              <h3>Conflitos</h3>
              {renderedMap.conflicts.map((conflict, index) => (
                <p key={`${conflict.type}-${index}`}>{conflict.message ?? conflict.type}</p>
              ))}
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
