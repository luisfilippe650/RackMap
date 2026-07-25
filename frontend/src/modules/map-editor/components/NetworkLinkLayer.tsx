import type { EditorColumn, EditorRow, NetworkLinkDraft, RackSlotDraft } from '../map-editor.types';
import { itemGeometry } from '../utils/element-geometry';

function rackCenter(slot: RackSlotDraft, columns: EditorColumn[], rows: EditorRow[]) {
  const geometry = itemGeometry(slot, columns, rows);

  return {
    x: geometry.left + geometry.width / 2,
    y: geometry.top + geometry.height / 2
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

export function NetworkLinkLayer({
  columns,
  links,
  rackSlots,
  rows,
  selectedLinkId,
  onSelectLink,
  onStartPointDrag
}: {
  columns: EditorColumn[];
  links: NetworkLinkDraft[];
  rackSlots: RackSlotDraft[];
  rows: EditorRow[];
  selectedLinkId?: string | null;
  onSelectLink?: (linkId: string) => void;
  onStartPointDrag?: (linkId: string, pointIndex: number, event: React.PointerEvent<SVGCircleElement>) => void;
}) {
  const rackById = new Map(rackSlots.map((slot) => [slot.id, slot]));

  return (
    <svg className="network-link-layer" aria-label="Links de rede">
      {links.map((link) => {
        const sourceRack = rackById.get(link.sourceRackSlotId);
        const targetRack = rackById.get(link.targetRackSlotId);

        if (!sourceRack || !targetRack) {
          return null;
        }

        const source = rackCenter(sourceRack, columns, rows);
        const target = rackCenter(targetRack, columns, rows);
        const points = [source, ...link.pathPoints, target];
        const polylinePoints = pointsAttribute(points);
        const label = labelPoint(points);
        const selected = selectedLinkId === link.id;

        return (
          <g
            className={`network-link ${selected ? 'selected' : ''}`}
            data-network-link-id={link.id}
            key={link.id}
            onPointerDown={(event) => {
              event.stopPropagation();
              onSelectLink?.(link.id);
            }}
          >
            <polyline className="network-link-hitbox" points={polylinePoints} />
            <polyline className="network-link-line" points={polylinePoints} stroke={link.color} />
            <circle className="network-link-endpoint" cx={source.x} cy={source.y} r="4" />
            <circle className="network-link-endpoint" cx={target.x} cy={target.y} r="4" />
            {selected ? link.pathPoints.map((point, pointIndex) => (
              <circle
                className="network-link-waypoint"
                cx={point.x}
                cy={point.y}
                data-network-link-point
                key={`${link.id}-point-${pointIndex}`}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onStartPointDrag?.(link.id, pointIndex, event);
                }}
                r="6"
              />
            )) : null}
            <text className="network-link-label" x={label.x} y={label.y - 8}>
              {link.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
