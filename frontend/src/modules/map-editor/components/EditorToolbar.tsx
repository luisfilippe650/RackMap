import { DoorOpen, Eraser, Grid2X2, MousePointer2, PanelTop, Server, SquareDashedMousePointer, TableCellsSplit } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { EditorTool } from '../map-editor.types';

const tools: Array<{ tool: EditorTool; label: string; icon: typeof MousePointer2 }> = [
  { tool: 'SELECT', label: 'Selecionar', icon: MousePointer2 },
  { tool: 'RACK_SLOT', label: 'Rack', icon: Server },
  { tool: 'WALL', label: 'Parede', icon: PanelTop },
  { tool: 'PDU', label: 'PDU', icon: Grid2X2 },
  { tool: 'DOOR', label: 'Porta', icon: DoorOpen },
  { tool: 'CORRIDOR', label: 'Corredor', icon: TableCellsSplit },
  { tool: 'COLUMN', label: 'Coluna', icon: SquareDashedMousePointer },
  { tool: 'ERASER', label: 'Apagar', icon: Eraser }
];

export function EditorToolbar({ activeTool, onToolChange }: { activeTool: EditorTool; onToolChange: (tool: EditorTool) => void }) {
  return (
    <aside className="map-editor-tools">
      {tools.map(({ tool, label, icon: Icon }) => (
        <Button key={tool} variant={activeTool === tool ? 'primary' : 'secondary'} onClick={() => onToolChange(tool)}>
          <Icon size={16} />
          {label}
        </Button>
      ))}
    </aside>
  );
}
