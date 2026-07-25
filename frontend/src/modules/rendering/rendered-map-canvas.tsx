import type { CSSProperties } from 'react';
import type { RenderedMapResponse } from '../../types/rackmap';
import { MapElementView } from './map-element';
import { RackElement } from './rack-element';

type RenderedMapCanvasProps = {
  renderedMap: RenderedMapResponse;
  networkLinks?: RenderedMapResponse['networkLinks'];
  showAxes: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showNetworkOnly?: boolean;
  zoom: number;
  onRackClick?: (rack: RenderedMapResponse['racks'][number]) => void;
};

function startOffsets(sizes: number[]) {
  let offset = 0;

  return sizes.map((size) => {
    const currentOffset = offset;
    offset += size;

    return currentOffset;
  });
}

function gridBoundaries(sizes: number[], totalSize: number) {
  const boundaries = startOffsets(sizes);

  return [...boundaries, totalSize];
}

function rackCenter(rack: RenderedMapResponse['racks'][number]) {
  return {
    x: rack.geometry.x + rack.geometry.width / 2,
    y: rack.geometry.y + rack.geometry.height / 2
  };
}

function pointsAttribute(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function labelPoint(points: Array<{ x: number; y: number }>) {
  const index = Math.max(0, Math.floor((points.length - 1) / 2));
  const current = points[index];
  const next = points[index + 1] ?? current;

  return {
    x: (current.x + next.x) / 2,
    y: (current.y + next.y) / 2
  };
}

export function RenderedMapCanvas({ renderedMap, networkLinks: visibleNetworkLinks, showAxes, showGrid, showLabels, showNetworkOnly = false, zoom, onRackClick }: RenderedMapCanvasProps) {
  const mapWidth = Number(renderedMap.map.width);
  const mapHeight = Number(renderedMap.map.height);
  const safeMapWidth = Number.isFinite(mapWidth) ? mapWidth : 0;
  const safeMapHeight = Number.isFinite(mapHeight) ? mapHeight : 0;
  const columns = renderedMap.map.columns ?? [];
  const rows = renderedMap.map.rows ?? [];
  const columnSizes = columns.map((column) => Number(column.width ?? 0));
  const rowSizes = rows.map((row) => Number(row.height ?? 0));
  const columnOffsets = startOffsets(columnSizes);
  const rowOffsets = startOffsets(rowSizes);
  const verticalGridLines = gridBoundaries(columnSizes, safeMapWidth);
  const horizontalGridLines = gridBoundaries(rowSizes, safeMapHeight);
  const printScale = safeMapWidth > 0 && safeMapHeight > 0
    ? Math.min(1, 620 / safeMapWidth, 860 / safeMapHeight)
    : 1;
  const mapCenterStyle = {
    width: safeMapWidth * zoom,
    height: safeMapHeight * zoom,
    '--print-scale': printScale,
    '--print-width': `${safeMapWidth * printScale}px`,
    '--print-height': `${safeMapHeight * printScale}px`
  } as CSSProperties;
  const networkLinks = showNetworkOnly ? (visibleNetworkLinks ?? renderedMap.networkLinks ?? []) : [];
  const rackById = new Map(renderedMap.racks.filter((rack) => rack.id !== undefined).map((rack) => [Number(rack.id), rack]));

  return (
    <div className="canvas-viewport viewer-canvas-viewport">
      <div className="viewer-map-center" style={mapCenterStyle}>
        <div
          className={`map-canvas ${showGrid ? 'map-canvas-grid' : ''} ${showLabels ? '' : 'hide-labels'}`}
          style={{
            width: safeMapWidth,
            height: safeMapHeight,
            transform: `scale(${zoom})`,
            backgroundColor: renderedMap.map.backgroundColor ?? undefined
          }}
        >
          {showGrid ? (
            <div className="viewer-grid-lines" aria-hidden="true">
              {verticalGridLines.map((offset, index) => (
                <span className="viewer-grid-line viewer-grid-line-vertical" key={`vertical-${index}-${offset}`} style={{ left: offset }} />
              ))}
              {horizontalGridLines.map((offset, index) => (
                <span className="viewer-grid-line viewer-grid-line-horizontal" key={`horizontal-${index}-${offset}`} style={{ top: offset }} />
              ))}
            </div>
          ) : null}

          {showAxes ? (
            <>
              <div className="viewer-axis viewer-axis-columns" aria-hidden="true">
                {columns.map((column, index) => (
                  <span
                    key={column.id}
                    style={{
                      left: columnOffsets[index],
                      width: Number(column.width ?? 0)
                    }}
                  >
                    {column.code}
                  </span>
                ))}
              </div>
              <div className="viewer-axis viewer-axis-rows" aria-hidden="true">
                {rows.map((row, index) => (
                  <span
                    key={row.id}
                    style={{
                      height: Number(row.height ?? 0),
                      top: rowOffsets[index]
                    }}
                  >
                    {row.code}
                  </span>
                ))}
              </div>
            </>
          ) : null}

          {showNetworkOnly ? (
            <svg className="rendered-network-link-layer" aria-label="Fiacao de rede">
              {networkLinks.map((link) => {
                const sourceRack = rackById.get(link.sourceRackSlotId);
                const targetRack = rackById.get(link.targetRackSlotId);

                if (!sourceRack || !targetRack) {
                  return null;
                }

                const source = rackCenter(sourceRack);
                const target = rackCenter(targetRack);
                const points = [source, ...(link.pathPoints ?? []), target];
                const label = labelPoint(points);

                return (
                  <g className="rendered-network-link" key={link.id}>
                    <polyline points={pointsAttribute(points)} stroke={link.color ?? '#f59e0b'} />
                    <text x={label.x} y={label.y - 8}>{link.name}</text>
                  </g>
                );
              })}
            </svg>
          ) : null}

          {renderedMap.elements.map((element) => (
            <MapElementView key={element.id} element={element} />
          ))}

          {renderedMap.racks.map((rack) => (
            <RackElement key={rack.id ?? rack.externalRackId} onClick={onRackClick} rack={rack} />
          ))}
        </div>
      </div>
    </div>
  );
}
