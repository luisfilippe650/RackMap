import { useParams } from 'react-router-dom';
import { LoadingState } from '../../components/feedback/loading-state';
import { MapEditor } from '../../modules/map-editor/components/MapEditor';
import { useMapEditorQuery } from '../../modules/map-editor/hooks/useMapEditor';

function parseMapId(value?: string) {
  return Number(value ?? Number.NaN);
}

export function MapEditorPage() {
  const { mapId: mapIdParam } = useParams();
  const mapId = parseMapId(mapIdParam);
  const editorQuery = useMapEditorQuery(mapId);

  if (editorQuery.isLoading) {
    return <LoadingState label="Carregando editor visual" />;
  }

  if (editorQuery.isError) {
    return <section className="page-panel">{editorQuery.error.message}</section>;
  }

  if (!editorQuery.data) {
    return <section className="page-panel">Mapa nao encontrado</section>;
  }

  return <MapEditor initialState={editorQuery.data} mapId={mapId} />;
}
