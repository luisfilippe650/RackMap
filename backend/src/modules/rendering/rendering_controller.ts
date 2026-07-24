import { FastifyReply, FastifyRequest } from "fastify";
import { RenderingParamsSchema, RenderMapSchema } from "./rendering_dto";
import {
    renderMapService,
    RenderingDependencyError,
    RenderingNotFoundError,
} from "./rendering_service";

function handleRenderingError(error: unknown, reply: FastifyReply) {
    if (error instanceof RenderingNotFoundError) {
        return reply.status(404).send({ message: error.message });
    }

    if (error instanceof RenderingDependencyError) {
        return reply.status(502).send({ message: error.message });
    }

    throw error;
}

export async function renderMapController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId } = RenderingParamsSchema.parse(request.params);
        const body = RenderMapSchema.parse(request.body ?? {});
        const rendering = await renderMapService(mapId, body);

        return reply.status(200).send(rendering);
    } catch (error) {
        return handleRenderingError(error, reply);
    }
}
