import { FastifyReply, FastifyRequest } from "fastify";
import {
    CreateElementSchema,
    ElementIdParamsSchema,
    ElementMapParamsSchema,
    ElementParamsSchema,
    GroupWallElementsSchema,
    ListElementsSchema,
    SetElementAppearanceSchema,
    SetElementPositionSchema,
    SetElementRotationSchema,
    SetElementSizeSchema,
    UpdateElementSchema,
} from "./elements_dto";
import {
    createElementService,
    deleteElementService,
    deleteElementByIdService,
    ElementInvalidOperationError,
    ElementNotFoundError,
    findElementByIdService,
    groupWallElementsService,
    listElementsService,
    setElementAppearanceService,
    setElementPositionService,
    setElementRotationService,
    setElementSizeService,
    updateElementByIdService,
    updateElementService,
} from "./elements_service";

function handleElementError(error: unknown, reply: FastifyReply) {
    if (error instanceof ElementNotFoundError) {
        return reply.status(404).send({ message: error.message });
    }

    if (error instanceof ElementInvalidOperationError) {
        return reply.status(400).send({ message: error.message });
    }

    throw error;
}

export async function listElementsController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId } = ElementMapParamsSchema.parse(request.params);
        const query = ListElementsSchema.parse(request.query);
        const elements = await listElementsService(mapId, query);

        return reply.status(200).send(elements);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function createElementController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId } = ElementMapParamsSchema.parse(request.params);
        const body = CreateElementSchema.parse(request.body);
        const element = await createElementService(mapId, body);

        return reply.status(201).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function findElementByIdController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { elementId } = ElementIdParamsSchema.parse(request.params);
        const element = await findElementByIdService(elementId);

        return reply.status(200).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function updateElementController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId, elementId } = ElementParamsSchema.parse(request.params);
        const body = UpdateElementSchema.parse(request.body);
        const element = await updateElementService(mapId, elementId, body);

        return reply.status(200).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function updateElementByIdController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { elementId } = ElementIdParamsSchema.parse(request.params);
        const body = UpdateElementSchema.parse(request.body);
        const element = await updateElementByIdService(elementId, body);

        return reply.status(200).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function deleteElementByIdController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { elementId } = ElementIdParamsSchema.parse(request.params);

        await deleteElementByIdService(elementId);

        return reply.status(204).send();
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function deleteElementController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId, elementId } = ElementParamsSchema.parse(request.params);

        await deleteElementService(mapId, elementId);

        return reply.status(204).send();
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function setElementPositionController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        const { mapId, elementId } = ElementParamsSchema.parse(request.params);
        const body = SetElementPositionSchema.parse(request.body);
        const element = await setElementPositionService(mapId, elementId, body);

        return reply.status(200).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function setElementSizeController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId, elementId } = ElementParamsSchema.parse(request.params);
        const body = SetElementSizeSchema.parse(request.body);
        const element = await setElementSizeService(mapId, elementId, body);

        return reply.status(200).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function setElementRotationController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        const { mapId, elementId } = ElementParamsSchema.parse(request.params);
        const body = SetElementRotationSchema.parse(request.body);
        const element = await setElementRotationService(mapId, elementId, body);

        return reply.status(200).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function setElementAppearanceController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        const { mapId, elementId } = ElementParamsSchema.parse(request.params);
        const body = SetElementAppearanceSchema.parse(request.body);
        const element = await setElementAppearanceService(mapId, elementId, body);

        return reply.status(200).send(element);
    } catch (error) {
        return handleElementError(error, reply);
    }
}

export async function groupWallElementsController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        const { mapId } = ElementMapParamsSchema.parse(request.params);
        const body = GroupWallElementsSchema.parse(request.body);
        const elements = await groupWallElementsService(mapId, body);

        return reply.status(200).send(elements);
    } catch (error) {
        return handleElementError(error, reply);
    }
}
