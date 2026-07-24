import { FastifyReply, FastifyRequest } from "fastify";
import {
    ColumnIdParamsSchema,
    ColumnParamsSchema,
    CreateColumnsSchema,
    CreateRowsSchema,
    MapAxisParamsSchema,
    ReorderAxisSchema,
    RowIdParamsSchema,
    RowParamsSchema,
    SetAxesSchema,
    SetColumnWidthSchema,
    SetRowHeightSchema,
    UpdateColumnSchema,
    UpdateRowSchema,
} from "./axes_dto";
import {
    createColumnsService,
    createRowsService,
    deleteColumnService,
    deleteRowService,
    getAxesService,
    listColumnsService,
    listRowsService,
    reorderColumnsService,
    reorderRowsService,
    setAxesService,
    setColumnWidthService,
    setRowHeightService,
    updateColumnService,
    updateRowService,
} from "./axes_service";

export async function getAxesController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const axes = await getAxesService(mapId);

    if (!axes) {
        return reply.status(404).send({ message: 'Map not found' });
    }

    return reply.status(200).send(axes);
}

export async function listColumnsController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const columns = await listColumnsService(mapId);

    return reply.status(200).send(columns);
}

export async function listRowsController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const rows = await listRowsService(mapId);

    return reply.status(200).send(rows);
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

export async function updateColumnController(request: FastifyRequest, reply: FastifyReply) {
    const { columnId } = ColumnIdParamsSchema.parse(request.params);
    const body = UpdateColumnSchema.parse(request.body);
    const column = await updateColumnService(columnId, body);

    return reply.status(200).send(column);
}

export async function updateRowController(request: FastifyRequest, reply: FastifyReply) {
    const { rowId } = RowIdParamsSchema.parse(request.params);
    const body = UpdateRowSchema.parse(request.body);
    const row = await updateRowService(rowId, body);

    return reply.status(200).send(row);
}

export async function deleteColumnController(request: FastifyRequest, reply: FastifyReply) {
    const { columnId } = ColumnIdParamsSchema.parse(request.params);

    await deleteColumnService(columnId);

    return reply.status(204).send();
}

export async function deleteRowController(request: FastifyRequest, reply: FastifyReply) {
    const { rowId } = RowIdParamsSchema.parse(request.params);

    await deleteRowService(rowId);

    return reply.status(204).send();
}

export async function setAxesController(request: FastifyRequest, reply: FastifyReply) {
    const { mapId } = MapAxisParamsSchema.parse(request.params);
    const body = SetAxesSchema.parse(request.body);
    const axes = await setAxesService(mapId, body);

    return reply.status(200).send(axes);
}
