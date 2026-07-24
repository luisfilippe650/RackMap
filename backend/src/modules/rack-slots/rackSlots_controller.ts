import { FastifyReply, FastifyRequest } from "fastify";
import {
    CreateRackSlotSchema,
    FindRackSlotByPositionSchema,
    RackSlotIdParamsSchema,
    RackSlotMapParamsSchema,
    RackSlotParamsSchema,
    SetRackSlotActiveSchema,
    SetRackSlotCoordinatesSchema,
    SetRackSlotSizeSchema,
    UpdateRackSlotSchema,
} from "./rackSlots_dto";
import {
    createRackSlotService,
    deleteRackSlotByIdService,
    findRackSlotByIdService,
    findRackSlotByPositionService,
    listRackSlotsService,
    RackSlotConflictError,
    RackSlotNotFoundError,
    setRackSlotActiveService,
    setRackSlotCoordinatesService,
    setRackSlotSizeService,
    updateRackSlotByIdService,
    updateRackSlotService,
} from "./rackSlots_service";

function handleRackSlotError(error: unknown, reply: FastifyReply) {
    if (error instanceof RackSlotNotFoundError) {
        return reply.status(404).send({ message: error.message });
    }

    if (error instanceof RackSlotConflictError) {
        return reply.status(409).send({ message: error.message });
    }

    throw error;
}

export async function listRackSlotsController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId } = RackSlotMapParamsSchema.parse(request.params);
        const rackSlots = await listRackSlotsService(mapId);

        return reply.status(200).send(rackSlots);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function findRackSlotByPositionController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        const { mapId, rowCode, rackCode } = FindRackSlotByPositionSchema.parse(request.params);
        const rackSlot = await findRackSlotByPositionService(mapId, rowCode, rackCode);

        if (!rackSlot) {
            return reply.status(404).send({ message: 'Rack slot not found' });
        }

        return reply.status(200).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function findRackSlotByIdController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { rackSlotId } = RackSlotIdParamsSchema.parse(request.params);
        const rackSlot = await findRackSlotByIdService(rackSlotId);

        return reply.status(200).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function createRackSlotController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId } = RackSlotMapParamsSchema.parse(request.params);
        const body = CreateRackSlotSchema.parse(request.body);
        const rackSlot = await createRackSlotService(mapId, body);

        return reply.status(201).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function updateRackSlotController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId, slotId } = RackSlotParamsSchema.parse(request.params);
        const body = UpdateRackSlotSchema.parse(request.body);
        const rackSlot = await updateRackSlotService(mapId, slotId, body);

        return reply.status(200).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function updateRackSlotByIdController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { rackSlotId } = RackSlotIdParamsSchema.parse(request.params);
        const body = UpdateRackSlotSchema.parse(request.body);
        const rackSlot = await updateRackSlotByIdService(rackSlotId, body);

        return reply.status(200).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function deleteRackSlotByIdController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { rackSlotId } = RackSlotIdParamsSchema.parse(request.params);

        await deleteRackSlotByIdService(rackSlotId);

        return reply.status(204).send();
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function setRackSlotCoordinatesController(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    try {
        const { mapId, slotId } = RackSlotParamsSchema.parse(request.params);
        const body = SetRackSlotCoordinatesSchema.parse(request.body);
        const rackSlot = await setRackSlotCoordinatesService(mapId, slotId, body);

        return reply.status(200).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function setRackSlotSizeController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId, slotId } = RackSlotParamsSchema.parse(request.params);
        const body = SetRackSlotSizeSchema.parse(request.body);
        const rackSlot = await setRackSlotSizeService(mapId, slotId, body);

        return reply.status(200).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}

export async function setRackSlotActiveController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { mapId, slotId } = RackSlotParamsSchema.parse(request.params);
        const body = SetRackSlotActiveSchema.parse(request.body);
        const rackSlot = await setRackSlotActiveService(mapId, slotId, body);

        return reply.status(200).send(rackSlot);
    } catch (error) {
        return handleRackSlotError(error, reply);
    }
}
