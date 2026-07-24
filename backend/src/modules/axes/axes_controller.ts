import { FastifyReply, FastifyRequest } from "fastify";
import {
    ColumnParamsSchema,
    CreateColumnsSchema,
    CreateRowsSchema,
    MapAxisParamsSchema,
    ReorderAxisSchema,
    RowParamsSchema,
    SetColumnWidthSchema,
    SetRowHeightSchema,
} from "./axes_dto";
import {
    createColumnsService,
    createRowsService,
    getAxesService,
    reorderColumnsService,
    reorderRowsService,
    setColumnWidthService,
    setRowHeightService,
} from "./axes_service";

export async function getAxesController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const axes = await getAxesService(mapId);

    if (!axes) {
        return reply.status(404).send({ message: 'Map not found' });
    }

    return reply.status(200).send(axes);
}

export async function createColumnsController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const body = CreateColumnsSchema.parse(request.body);
    const columns = await createColumnsService(mapId, body);

    return reply.status(201).send(columns);
}

export async function createRowsController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const body = CreateRowsSchema.parse(request.body);
    const rows = await createRowsService(mapId, body);

    return reply.status(201).send(rows);
}

export async function reorderColumnsController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const body = ReorderAxisSchema.parse(request.body);
    const columns = await reorderColumnsService(mapId, body);

    return reply.status(200).send(columns);
}

export async function reorderRowsController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const body = ReorderAxisSchema.parse(request.body);
    const rows = await reorderRowsService(mapId, body);

    return reply.status(200).send(rows);
}

export async function setColumnWidthController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId, columnId } = ColumnParamsSchema.parse(request.params);
    const body = SetColumnWidthSchema.parse(request.body);
    const column = await setColumnWidthService(mapId, columnId, body);

    return reply.status(200).send(column);
}

export async function setRowHeightController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId, rowId } = RowParamsSchema.parse(request.params);
    const body = SetRowHeightSchema.parse(request.body);
    const row = await setRowHeightService(mapId, rowId, body);

    return reply.status(200).send(row);
}
