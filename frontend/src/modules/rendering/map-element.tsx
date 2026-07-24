import type { MapElement } from '../../types/rackmap';

const elementLabels: Record<string, string> = {
  PDU: 'PDU',
  WALL: 'Parede',
  DOOR: 'Porta',
  CORRIDOR: 'Corredor',
  COLUMN: 'Coluna',
  UPS: 'UPS',
  AIR_CONDITIONER: 'Ar-cond.',
  ELECTRICAL_PANEL: 'Painel',
  EMPTY_AREA: 'Vazio',
  CUSTOM: 'Item'
};

export function MapElementView({ element }: { element: MapElement }) {
  const geometry = element.geometry ?? {
    x: element.positionX,
    y: element.positionY,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    zIndex: element.zIndex
  };

  return (
    <div
      className={`map-element map-element-${element.type.toLowerCase()}`}
      style={{
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
        zIndex: geometry.zIndex,
        backgroundColor: element.fillColor ?? undefined,
        borderColor: element.borderColor ?? undefined,
        color: element.textColor ?? undefined
      }}
      title={element.label ?? elementLabels[element.type]}
    >
      <span>{element.label ?? elementLabels[element.type]}</span>
    </div>
  );
}
