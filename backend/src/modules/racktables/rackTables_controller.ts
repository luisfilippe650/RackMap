import { FastifyReply, FastifyRequest } from 'fastify';
import { ListRackTablesRacksSchema, RackTablesObjectParamsSchema, RackTablesRackParamsSchema } from './rackTables_dto';
import {
    findRackTablesRackByIdService,
    getRackTablesObjectSummaryService,
    getRackTablesRackOccupancyService,
    listRackTablesRacksService,
    RackTablesNotFoundError,
    RackTablesUnavailableError,
} from './rackTables_service';

function handleRackTablesError(error: unknown, reply: FastifyReply) {
    if (error instanceof RackTablesNotFoundError) {
        return reply.status(404).send({ message: error.message });
    }

    if (error instanceof RackTablesUnavailableError) {
        return reply.status(502).send({ message: error.message });
    }

    throw error;
}

export async function listRackTablesRacksController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { search } = ListRackTablesRacksSchema.parse(request.query);
        const racks = await listRackTablesRacksService(search);

        return reply.status(200).send(racks);
    } catch (error) {
        return handleRackTablesError(error, reply);
    }
}

export async function findRackTablesRackByIdController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { rackId } = RackTablesRackParamsSchema.parse(request.params);
        const rack = await findRackTablesRackByIdService(rackId);

        return reply.status(200).send(rack);
    } catch (error) {
        return handleRackTablesError(error, reply);
    }
}

export async function getRackTablesRackOccupancyController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { rackId } = RackTablesRackParamsSchema.parse(request.params);
        const occupancy = await getRackTablesRackOccupancyService(rackId);

        return reply.status(200).send(occupancy);
    } catch (error) {
        return handleRackTablesError(error, reply);
    }
}

export async function getRackTablesObjectSummaryController(request: FastifyRequest, reply: FastifyReply) {
    try {
        const { objectId } = RackTablesObjectParamsSchema.parse(request.params);
        const summary = await getRackTablesObjectSummaryService(objectId);

        return reply.status(200).send(summary);
    } catch (error) {
        return handleRackTablesError(error, reply);
    }
}
