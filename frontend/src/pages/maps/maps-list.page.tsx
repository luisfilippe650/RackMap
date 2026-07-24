import { Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/feedback/empty-state';
import { LoadingState } from '../../components/feedback/loading-state';
import { useDeleteMap, useDuplicateMap, useMaps } from '../../modules/maps/use-maps';
import type { DatacenterMap } from '../../types/rackmap';

export function MapsListPage() {
  const mapsQuery = useMaps();
  const deleteMap = useDeleteMap();
  const duplicateMap = useDuplicateMap();
  const [mapToDelete, setMapToDelete] = useState<DatacenterMap | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  async function confirmDeleteMap() {
    if (!mapToDelete) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMap.mutateAsync(mapToDelete.id);
      setMapToDelete(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Falha ao excluir o mapa.');
    }
  }

  async function duplicateSelectedMap(map: DatacenterMap) {
    setDuplicateError(null);

    try {
      await duplicateMap.mutateAsync(map.id);
    } catch (error) {
      setDuplicateError(error instanceof Error ? error.message : 'Falha ao duplicar o mapa.');
    }
  }

  if (mapsQuery.isLoading) {
    return <LoadingState label="Carregando mapas" />;
  }

  if (mapsQuery.isError) {
    return <EmptyState title="Nao foi possivel carregar os mapas">{mapsQuery.error.message}</EmptyState>;
  }

  const maps = mapsQuery.data ?? [];

  return (
    <section className="page-stack">
      {mapToDelete ? (
        <div className="confirm-overlay" role="presentation">
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-map-title">
            <h2 id="delete-map-title">Excluir mapa?</h2>
            <p>
              Esta acao vai remover o mapa <strong>{mapToDelete.name}</strong> e todos os elementos configurados nele.
            </p>
            {deleteError ? <p className="error-text">{deleteError}</p> : null}
            <div className="confirm-actions">
              <Button disabled={deleteMap.isPending} onClick={() => setMapToDelete(null)}>
                Cancelar
              </Button>
              <Button disabled={deleteMap.isPending} onClick={confirmDeleteMap} variant="danger">
                <Trash2 size={16} />
                {deleteMap.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="page-heading">
        <div>
          <h1>Mapas</h1>
          <p>Plantas do datacenter.</p>
        </div>
        <Link className="button button-primary" to="/maps/new">
          Novo mapa
        </Link>
      </div>
      {duplicateError ? <p className="error-text">{duplicateError}</p> : null}

      {maps.length === 0 ? (
        <EmptyState title="Nenhum mapa cadastrado">Crie a primeira planta para configurar eixos, slots e elementos.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((map) => (
                <tr key={map.id}>
                  <td>
                    <Link className="map-name-link" to={`/maps/${map.id}/view`}>
                      <strong>{map.name}</strong>
                    </Link>
                    {map.description ? <p className="map-description">{map.description}</p> : null}
                  </td>
                  <td>
                    <div className="action-row">
                      <Button
                        aria-label="Duplicar mapa"
                        className="icon-button"
                        disabled={duplicateMap.isPending}
                        onClick={() => duplicateSelectedMap(map)}
                        title="Duplicar"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        aria-label="Excluir mapa"
                        className="icon-button"
                        disabled={deleteMap.isPending}
                        onClick={() => {
                          setDeleteError(null);
                          setMapToDelete(map);
                        }}
                        title="Excluir"
                        variant="danger"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
