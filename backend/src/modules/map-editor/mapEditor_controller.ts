import { FastifyReply, FastifyRequest } from 'fastify';
import { MapEditorParamsSchema, SaveMapEditorSchema } from './mapEditor_dto';
import { getMapEditorService, MapEditorNotFoundError, saveMapEditorService } from './mapEditor_service';

function handleMapEditorError(error: unknown, reply: FastifyReply) {
    if (error instanceof MapEditorNotFoundError) {
        return reply.status(404).send({ message: error.message });
    }

    throw error;
}

export async function getMapEditorController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId } = MapEditorParamsSchema.parse(request.params);
        const editor = await getMapEditorService(mapId);

        return reply.status(200).send(editor);
    } catch (error) {
        return handleMapEditorError(error, reply);
    }
}

export async function saveMapEditorController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId } = MapEditorParamsSchema.parse(request.params);
        const body = SaveMapEditorSchema.parse(request.body);
        const editor = await saveMapEditorService(mapId, body);

        return reply.status(200).send(editor);
    } catch (error) {
        return handleMapEditorError(error, reply);
    }
}
