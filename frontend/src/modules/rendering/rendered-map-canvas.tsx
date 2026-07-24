import type { CSSProperties } from 'react';
import type { RenderedMapResponse } from '../../types/rackmap';
import { MapElementView } from './map-element';
import { RackElement } from './rack-element';

type RenderedMapCanvasProps = {
  renderedMap: RenderedMapResponse;
  showAxes: boolean;
  showGrid: boolean;
  showLabels: boolean;
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

export function RenderedMapCanvas({ renderedMap, showAxes, showGrid, showLabels, zoom, onRackClick }: RenderedMapCanvasProps) {
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

          {renderedMap.elements.map((element) => (
            <MapElementView key={element.id} element={element} />
          ))}

          {renderedMap.racks.map((rack) => (
            <RackElement key={rack.externalRackId} onClick={onRackClick} rack={rack} />
          ))}
        </div>
      </div>
    </div>
  );
}
