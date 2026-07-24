import type { RenderedRack } from '../../types/rackmap';

export function RackElement({ rack, onClick }: { rack: RenderedRack; onClick?: (rack: RenderedRack) => void }) {
  const rackAddress = [rack.rowCode, rack.rackCode].filter(Boolean).join('-');
  const displayName = rack.label ?? rack.rackTablesRackName ?? rack.name;

  return (
    <button
      className="rack-element"
      onClick={() => onClick?.(rack)}
      style={{
        left: rack.geometry.x,
        top: rack.geometry.y,
        width: rack.geometry.width,
        height: rack.geometry.height,
        zIndex: rack.geometry.zIndex,
        backgroundColor: rack.fillColor ?? undefined,
        borderColor: rack.borderColor ?? undefined,
        color: rack.textColor ?? undefined
      }}
      title={`${displayName}${rackAddress ? ` ${rackAddress}` : ''}`}
      type="button"
    >
      <strong>{displayName}</strong>
      <span>{rack.rackTablesRackName ?? (rackAddress || 'Manual')}</span>
    </button>
  );
}
