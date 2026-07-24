import { FastifyInstance } from 'fastify';
import { getMapEditorController, saveMapEditorController } from './mapEditor_controller';

export async function MapEditorRoutes(app: FastifyInstance) {
    app.get('/maps/:mapId/editor', getMapEditorController);
    app.put('/maps/:mapId/editor', saveMapEditorController);
}
